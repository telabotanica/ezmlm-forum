/**
 * Convenience parent class gathering config params and utility methods
 */
function EzmlmForum() {
	this.config = {};
	this.listRoot = '';
	this.appLoadedOnce = false;
	// text enriching options
	this.enrich = {
		media: false,
		links: true,
		binettes: false
	};
	this.calendarOptions = {
		sameDay: 'HH:mm',
		lastDay: '[hier à] HH:mm',
		nextDay: '[demain à] HH:mm',
		lastWeek: 'dddd [à] HH:mm',
		nextWeek: 'dddd [prochain à] HH:mm', // doesn't work => WTF ?
		sameElse: 'DD/MM YYYY'
	};
	this.runningQuery = null;
	this.auth = null;
	// absolute links everywhere
	this.linkBase = null;
}

// loads the stringified JSON configuration given by PHP through the HTML view template
EzmlmForum.prototype.setConfig = function(configString) {
	//console.log('EzmlmForum.setConfig()');
	this.config = JSON.parse(configString);
	this.linkBase = this.config.domainRoot + this.config.baseUri;
	//console.log('Link base: ' + this.linkBase);
	this.listRoot = this.config['ezmlm-php'].rootUri + '/lists/' + this.config['ezmlm-php'].list;
};

// starts the job
EzmlmForum.prototype.init = function() {
	//console.log('EzmlmForum.init()');
	this.initDefaults();
	var lthis = this;
	// bind URL (fragment) to app state
	$jq(window).on('hashchange', function() {
		//console.log('hash changed : [' + window.location.hash + ']');
		lthis.loadAppStateFromUrl();
	});
	// load auth and user info
	this.auth = new AuthAdapter(this.config);
  this.initialLoadAuth();

  //Initialize the task to run every 450000 milliseconds
	 // i.e. 10 minutes to avoid JWT token expiration after 15 minutes.
	 setInterval(function() {
	 	console.log("refreshing token");
	 	lthis.auth.load(function() {console.log("JWToken refreshed!")});
	}, 600000);

};

EzmlmForum.prototype.initialLoadAuth = function() {
  var lthis = this;
	this.auth.load(function() {
		//console.log('Auth chargée');
		lthis.loadUserInfo(function() {
			//console.log(lthis.auth.user);
			// first time load
			// @WARNING it's said that Safari triggers hashchange on first time load !
			lthis.loadAppStateFromUrl();
			lthis.appLoadedOnce = true; // allows to read details only once
		});
	});
};

// set default values for attributes before binding URL to app state
// - to be overriden
EzmlmForum.prototype.initDefaults = function() {
	//console.log('EzmlmForum.initDefaults()');
};

/**
 * Renders #tpl-{id} template inside #{id} element, using {data}
 */
EzmlmForum.prototype.renderTemplate = function(id, data) {
	var container = $jq('#' + id),
		template = $jq('#tpl-' + id).html(),
		output = Mustache.render(template, data);
	container.html(output);
};

/**
 * Detects if a text is an address email, and if so censors the domain - intended
 * for author "names" that might be bare email addresses
 *
 * If allOccurrences is true, will censor all occurrences ("g" modifier)
 */
EzmlmForum.prototype.censorEmail = function(text, allOccurrences) {
	if (allOccurrences == undefined) allOccurrences = false;
	var replacePattern = /(.+@).+\..+/i;
	if (allOccurrences) {
		replacePattern = /(.+@).+\..+/ig;
	}
	if (text && text.match(/.+@.+\..+/i)) {
		// would it be quicker to try replacing without matching ?
		text = text.replace(replacePattern, "$1...");
	}
	return text;
};

/**
 * Takes a raw message text and tries to remove the quotations / original
 * message(s) part(s) to return only the message substance
 * @TODO test and improve
 */
EzmlmForum.prototype.cleanText = function(text, remove) {
	if (remove == undefined) remove = false;
	// (.|[\r\n]) simulates the DOTALL; [\s\S] doesn't work here, no idea why
	var patterns = [
		"----- ?(Original Message|Message d'origine) ?-----", // ?
		"Date: [a-zA-Z]{3}, [0-9]{1,2} [a-zA-Z]{3} [0-9]{4} [0-9]{2}:[0-9]{2}:[0-9]{2}( +[0-9]{4})?", // ?
		"________________________________", // outlook
		" _____ ", // ?
		"&gt; Message du", // ? @WARNING sometimes used for Fwd messages, which means relevant contents
		"------------------------------------------------------------------------", // AVAST
		"(le|on) ([0-9]{2}(/|-)[0-9]{2}(/|-)[0-9]{4}|[0-9]{4}(/|-)[0-9]{2}(/|-)[0-9]{2}) (à )?[0-9]{2}:[0-9]{2}", // Thunderbird
		"le [0-9]{1,2} [a-zA-Z]+\.? [0-9]{4} (à )?[0-9]{2}:[0-9]{2}", // ?
		//"-------- (Message transféré|Forwarded message) --------", // ? @WARNING forwarded message might be considered as "contents"
		".*From: .+[\n\r].*(Sent|To): .+", // ?
		//".*>[\n\r\t ]+>.*", // multiples consecutive lines starting with ">" @TODO doesn't work cause of "^" and "$" added in the loop below
		"(Envoyé de mon|Sent from my) i(Phone|Pad|Mac)" // iPhone / iPad
	];

	// delete matching part, or hide it in the interface ?
	var replacement = "$1<a title=\"cliquer pour afficher / masquer les messages cités\" href=\"#\" class=\"message-read-more\">"
		//+ "..."
		+ "-- message tronqué --"
		+ "</a><div class=\"message-read-more-contents\">$3</div>";
	if (remove) {
		replacement = "$1";
	}

	// test regexs but applies only the one that cuts the text at the highest position
	var regexToApply = null,
		longestCut = 0;
	for (var i=0; i < patterns.length; ++i) {
		//var re = new RegExp("(^(.|[\r\n])+?)" + patterns[i] + "(.|[\r\n])*$", "gim");
		var re = new RegExp("(^(.|[\r\n])+?)(" + patterns[i] + "(.|[\r\n])*)$", "gim");
		var matches = re.exec(text);
		var lengthToCut = 0;
		if (matches != null && matches.length > 3) {
			//console.log(' ++ regex : [' + patterns[i] + ']');
			lengthToCut = matches[3].length;
			//console.log('ON COUPE : [' + lengthToCut + ']');
		}
		if (lengthToCut > longestCut) {
			longestCut = lengthToCut;
			//console.log('this rule is better !');
			regexToApply = patterns[i];
		}
	}
	// apply "best" regex
	if (regexToApply != null) {
		var re = new RegExp("(^(.|[\r\n])+?)(" + regexToApply + "(.|[\r\n])*)$", "gim");
		text = text.replace(re, replacement);
	}

	// remove quotations
	text = this.removeQuotations(text);

	// trim whitespaces and line breaks
	if (text) {
		text = text.replace(/[ \t\r\n]*((.|[\r\n])+)[ \t\r\n]*$/i, "$1");
	}

	return text;
};
EzmlmForum.prototype.removeQuotations = function(text) {
	if (text) {
		var pattern = /\+\+\+\+\+\+([0-9]+)\+\+\+\+\+\+/;
		// ^ and $ don't work here => wtf ?
		text = text.replace(pattern, '');
	}
	return text;
};

/**
 * Takes a raw message text and enriches it : replaces common charater sequences
 * with emoji, \n with <br>s, URL with links, images / video URLs with media
 * contents
 */
EzmlmForum.prototype.enrichText = function(text) {
	if (text) {
		if (this.enrich.media) {
			text = this.addMedia(text);
		}
		if (this.enrich.links) {
			text = this.addLinks(text);
		}
		if (this.enrich.binettes) {
			// unicode smileys
			text = Binette.binettize(text);
		}
		// @TODO detect plant scientific names
		text = this.lf2br(text); // previous regex are conditioned by \n
	}
	return text;
};
EzmlmForum.prototype.lf2br = function(text) {
	if (text) {
		// 2 or more linebreaks => 2 <br> // @TODO doesn't work so well - fix it
		//console.log('TEXTE AVANT: ' + text);
		text = text.replace(/[\r\n]{2,}/g, "<br><br>");
		// remaining (single) line breaks => 1 <br>
		//text = text.replace(/[\n]{4}/g, "<br>");
		text = text.replace(/[\r\n]/g, "<br>");
		//console.log('TEXTE APRES: ' + text);
	}
	return text;
};
EzmlmForum.prototype.addLinks = function(text) {
	if (text) {
		// [^"] excludes links in markup attributes
		text = text.replace(/([^"])(https?:\/\/[^\ ,\n\t]+)([^"])/gi, '$1<a href="$2" target="_blank">$2</a>$3');
		// why doesn't this work ??? (exclude ending ">")
		//text = text.replace(/([^"])(https?:\/\/[^\ ,\n\t>]+)([^"])/gi, '$1<a href="$2" target="_blank">$2</a>$3');
	}
	return text;
};
EzmlmForum.prototype.addMedia = function(text) {
	if (text) {
		text = this.addNativeMedia(text);
		text = this.addOnlineMediaEmbedding(text);
	}
	return text;
};
/**
 * Replaces links pointing to native media
 */
EzmlmForum.prototype.addNativeMedia = function(text) {
	if (text) {
		// image
		text = text.replace(
			/(https?:\/\/[^ ,\n]+\.(jpg|jpeg|png|gif|tif|tiff|bmp))/gi,
			'<img src="$1" class="native-media-img"/>'
		);
		// video
		text = text.replace(
			/(https?:\/\/[^ ,\n]+\.(mp4|webm|ogv|3gp))/gi,
			'<video controls src="$1" class="native-media-video" />'
		);
		// audio
		text = text.replace(
			/(https?:\/\/[^ ,\n]+\.(mp3|oga|wav))/gi,
			'<audio controls src="$1" class="native-media-audio" />'
		);
	}
	return text;
};
/**
 * Detects popular online video players URLs and replaces them with a video
 * embedding
 * @TODO manage more video hosts, not only Youtube
 */
EzmlmForum.prototype.addOnlineMediaEmbedding = function(text) {
	if (text) {
		// Youtube
		text = text.replace(
			/https?:\/\/www\.youtube\.com\/watch\?v=([^ ,\n]+)/gi,
			'<iframe class="embedded-media-video embedded-media-youtube" src="https://www.youtube.com/embed/$1" allowfullscreen></iframe>'
		);
	}
	return text;
};

/**
 * Converts a raw text message to a minimalistic readable HTML version, and
 * removes the message quotation mark (++++++N++++++)
 */
EzmlmForum.prototype.rawMessageToHtml = function(rawText) {
	var HTML = rawText;
	HTML = HTML.replace(/\+\+\+\+\+\+[0-9]+\+\+\+\+\+\+/g,'');
	HTML = HTML.replace(/\n/g,'<br/>');
	return HTML;
};

/**
 * Uses moment.js to format dates : if time difference from now is lower than
 * 45 minutes, uses moment().fromNow(); otherwise uses moment().calendar() with
 * this.calendarOptions
 */
EzmlmForum.prototype.momentize = function(date) {
	var dateMoment = null,
		age = moment().diff(moment(date), 'minutes');
	if (age > 45) {
		dateMoment = moment(date).calendar(null, this.calendarOptions);
	} else {
		dateMoment = moment(date).fromNow();
	}
	return dateMoment;
};

/**
 * Toggles work indicator panel (#work-indicator) if it exists : shows it if
 * "work" is true, hides it if "work" is false
 */
EzmlmForum.prototype.working = function(work) {
	if (work == undefined) {
		work = true;
	}
	var workIndicator = $jq('#work-indicator');
	if (workIndicator != null) {
		if (work) {
			workIndicator.show();
		} else {
			workIndicator.hide();
		}
	}
};
/**
 * shows work indicator panel
 */
EzmlmForum.prototype.startWorking = function() {
	this.working(true);
};
/**
 * hides work indicator panel
 */
EzmlmForum.prototype.stopWorking = function() {
	this.working(false);
};

/**
 * aborts any running XHR query stored in this.runningQuery
 */
EzmlmForum.prototype.abortQuery = function() {
	if (this.runningQuery != null) { // didn't manage to detect if instanceof jqXHR => wtf ?
		try {
			//console.log('aborting query');
			this.runningQuery.abort();
		} catch(e) {
			//console.log('this.runningQuery was not an XHR');
		}
	}
};

/**
 * Questions the list about what the user rights are; if user.email is null,
 * will keep the default rights set in AuthAdapter
 */
EzmlmForum.prototype.loadUserInfo = function(cb) {
	var lthis = this;
	// supposed to contain the current user's email address
	if (this.auth.user.email != null) {
		// get user's rights for the current list
		var userInfoURL = lthis.listRoot + '/users/' + lthis.auth.user.email;
		$jq.ajax({
			url: userInfoURL,
			type: "GET",
			dataType: 'json'
		}).done(function(data) {
			if (data != null && data.rights != null) {
				// overwrites default rights
				lthis.auth.user.rights = data.rights;
			}
			cb(); // load app
		}).fail(cb); // cound not get user rights; load app anyway
	} else {
		cb(); // the token seems invalid; load app anyway
	}
};


// simple hash function converting a string to an integer
// http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
String.prototype.hashCode = function(){
	var hash = 0;
	if (this.length == 0) return hash;
	for (i = 0; i < this.length; i++) {
		char = this.charCodeAt(i);
		hash = ((hash<<5)-hash)+char;
		hash = hash & hash; // Convert to 32bit integer
	}
	return hash;
};
