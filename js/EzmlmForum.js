/**
 * Convenience parent class gathering config params and utility methods
 */
function EzmlmForum() {
	this.config = {};
	this.listRoot = '';
	// text enriching options
	this.enrich = {
		media: false,
		links: true,
		binettes: false
	};
	this.calendarOptions = {
		sameDay: 'HH:mm',
		lastDay: '[hier à] HH:mm',
		lastWeek: 'dddd [à] HH:mm',
		sameElse: 'DD/MM YYYY'
	};
}

// loads the stringified JSON configuration given by PHP through the HTML view template
EzmlmForum.prototype.setConfig = function(configString) {
	this.config = JSON.parse(configString);
	this.listRoot = this.config['ezmlm-php'].rootUri + '/lists/' + this.config['ezmlm-php'].list;
};

// starts the job
EzmlmForum.prototype.init = function() {
	console.log('EzmlmForum.init()');
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
 * Takes a raw message text and tries to remove the quotations / original
 * message(s) part(s) to return only the message substance
 * @TODO test and improve
 */
EzmlmForum.prototype.cleanText = function(text) {
	// (.|[\r\n]) simulates the DOTALL; [\s\S] doesn't work here, no idea why
	var patterns = [
		"----- Original Message -----", // ?
		"Date: [a-zA-Z]{3}, [0-9]{2} [a-zA-Z]{3} [0-9]{4} [0-9]{2}:[0-9]{2}:[0-9]{2}( +[0-9]{4})?", // ?
		"________________________________", // outlook
		"&gt; Message du" // ?
	];

	for (var i=0; i < patterns.length; ++i) {
		var re = new RegExp("(^(.|[\r\n])+?)" + patterns[i] + "(.|[\r\n])*$", "gim");
		text = text.replace(re, "$1");
	}

	// trim whitespaces and line breaks @TODO make this work !
	/*if (text.match(new RegExp("^[ \t\r\n]*((.|[\r\n])+)[ \t\r\n]*$"))) {
		console.log("ça matche");
	} else {
		console.log("ça matche pas");
	}
	console.log("AVANT: " + text);
	text = text.replace(/((.|[\r\n])+)[ \t\r\n]*$/ig, "$1");
	console.log("APRES: " + text);*/

	return text;
};

/**
 * Takes a raw message text and enriches it : replaces common charater sequences
 * with emoji, \n with <br>s, URL with links, images / video URLs with media
 * contents, and presents forum quotations nicely
 */
EzmlmForum.prototype.enrichText = function(text) {
	text = this.addQuotations(text);
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
	text = this.lf2br(text); // previous regex are conditioned by \n
	return text;
};
EzmlmForum.prototype.lf2br = function(text) {
	// 2 or more linebreaks => 2 <br>
	text = text.replace(/[\r\n]{2,}/g, "<br><br>");
	// remaining (single) line breaks => 1 <br>
	text = text.replace(/[\r\n]/g, "<br>");
	return text;
};
EzmlmForum.prototype.addQuotations = function(text) {
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
