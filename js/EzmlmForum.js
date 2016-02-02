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
}

// loads the stringified JSON configuration given by PHP through the HTML view template
EzmlmForum.prototype.setConfig = function(configString) {
	this.config = JSON.parse(configString);
	this.listRoot = this.config['ezmlm-php'].rootUri + '/lists/' + this.config['ezmlm-php'].list;
};

// starts the job
EzmlmForum.prototype.init = function() {
	console.log('EzmlmForum.init()');
	this.initDefaults();
	var lthis = this;
	// bind URL (fragment) to app state
	$(window).on('hashchange', function() {
		console.log('hash changed : [' + window.location.hash + ']');
		lthis.loadAppStateFromUrl();
	});
	// first time load
	// @WARNING it's said that Safari triggers hashchange on first time load !
	this.loadAppStateFromUrl();
	this.appLoadedOnce = true; // allows to read details only once
};

// set defult values for attributes before binding URL to app state
// - to be overrided
EzmlmForum.prototype.initDefaults = function() {
	console.log('EzmlmForum.initDefaults()');
};

/**
 * Renders #tpl-{id} template inside #{id} element, using {data}
 */
EzmlmForum.prototype.renderTemplate = function(id, data) {
	var container = $('#' + id),
		template = $('#tpl-' + id).html(),
		output = Mustache.render(template, data);
	container.html(output);
};

/**
 * Detects if a text is an address email, and if so censors the domain - intended
 * for author "names" that might be bare email addresses
 */
EzmlmForum.prototype.censorEmail = function(text) {
	if (text && text.match(/.+@.+\..+/i)) {
		// would it be quicker to try replacing without matching ?
		text = text.replace(/(.+@).+\..+/i, "$1...");
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
		"(le|on) ([0-9]{2}(/|-)[0-9]{2}(/|-)[0-9]{4}|[0-9]{4}(/|-)[0-9]{2}(/|-)[0-9]{2}) [0-9]{2}:[0-9]{2}", // Thunderbird
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
	text = text.replace(/[ \t\r\n]*((.|[\r\n])+)[ \t\r\n]*$/i, "$1");

	return text;
};
EzmlmForum.prototype.removeQuotations = function(text) {
	var pattern = /\+\+\+\+\+\+([0-9]+)\+\+\+\+\+\+/;
	// ^ and $ don't work here => wtf ?
	text = text.replace(pattern, '');
	return text;
};

/**
 * Takes a raw message text and enriches it : replaces common charater sequences
 * with emoji, \n with <br>s, URL with links, images / video URLs with media
 * contents
 */
EzmlmForum.prototype.enrichText = function(text) {
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
	return text;
};
EzmlmForum.prototype.lf2br = function(text) {
	// 2 or more linebreaks => 2 <br> // @TODO doesn't work so well - fix it
	//console.log('TEXTE AVANT: ' + text);
	text = text.replace(/[\r\n]{2,}/g, "<br><br>");
	// remaining (single) line breaks => 1 <br>
	//text = text.replace(/[\n]{4}/g, "<br>");
	text = text.replace(/[\r\n]/g, "<br>");
	//console.log('TEXTE APRES: ' + text);
	return text;
};
EzmlmForum.prototype.addLinks = function(text) {
	// [^"] excludes links in markup attributes
	text = text.replace(/([^"])(https?:\/\/[^ ,\n]+)([^"])/gi, '$1<a href="$2" target="_blank">$2</a>$3');
	return text;
};
EzmlmForum.prototype.addMedia = function(text) {
	text = this.addNativeMedia(text);
	text = this.addOnlineMediaEmbedding(text);
	return text;
};
/**
 * Replaces links pointing to native media
 */
EzmlmForum.prototype.addNativeMedia = function(text) {
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

	return text;
};
/**
 * Detects popular online video players URLs and replaces them with a video
 * embedding
 */
EzmlmForum.prototype.addOnlineMediaEmbedding = function(text) {
	// Youtube
	text = text.replace(
		/https?:\/\/www\.youtube\.com\/watch\?v=([^ ,\n]+)/gi,
		'<iframe class="embedded-media-video embedded-media-youtube" src="https://www.youtube.com/embed/$1" allowfullscreen></iframe>'
	);
	return text;
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
	var workIndicator = $('#work-indicator');
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
