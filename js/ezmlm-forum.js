/*$(document).ready(function() {
	console.log('Coucou !');
});*/

/**
 * "static-class-like" utility to replace emoticon-prone character sequences
 * (ie. ":)" or ":-(") in a text by corresponding unicode characters (emoji)
 */
function Binette() {
}
// add your binette here !
Binette.binettes = {
	"<3": "\u2764\uFE0F",
	"</3": "\uD83D\uDC94",
	":D": "\uD83D\uDE00",
	":-D": "\uD83D\uDE00",
	":)": "\uD83D\uDE03",
	":-)": "\uD83D\uDE03",
	";)": "\uD83D\uDE09",
	";-)": "\uD83D\uDE09",
	":(": "\uD83D\uDE12",
	":-(": "\uD83D\uDE12",
	":p": "\uD83D\uDE1B",
	":-p": "\uD83D\uDE1B",
	";p": "\uD83D\uDE1C",
	";-p": "\uD83D\uDE1C",
	":'(": "\uD83D\uDE22"
};
Binette.escapeSpecialChars = function(regex) {
	return regex.replace(/([()[{*+.$^\\|?])/g, '\\$1');
};
/**
 * Given a text, replaces every occurrence of any emoticon-prone characters
 * sequence with the corresponding unicode character (emoji), and returns the
 * modified text
 */
Binette.binettize = function(text) {
	for (var i in Binette.binettes) {
		var regex = new RegExp(Binette.escapeSpecialChars(i), 'gim');
		text = text.replace(regex, Binette.binettes[i]);
	}
	return text;
};

/**
 * Convenience parent class gathering config params and utility methods
 */
function EzmlmForum() {
	this.config = {};
	this.listRoot = '';
	this.binettes = true;
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
 * Takes a raw message text and tries to remove the quotations / original
 * message(s) part(s) to return only the message substance
 * @TODO do it !
 */
EzmlmForum.prototype.cleanText = function(text) {
	return text;
};

/**
 * Takes a raw message text and enriches it : replaces common charater sequences
 * with emoji, \n with <br>s, URL with links, images / video URLs with media
 * contents, and presents forum quotations nicely
 */
EzmlmForum.prototype.enrichText = function(text) {
	text = this.lf2br(text);
	text = this.addQuotations(text);
	text = this.addMedia(text);
	//text = this.addLinks(text);
	if (this.binettes) {
		// unicode smileys
		text = Binette.binettize(text);
	}
	return text;
};
EzmlmForum.prototype.lf2br = function(text) {
	return text.replace(/\n/g, "<br>");
};
EzmlmForum.prototype.addQuotations = function(text) {
	return text;
};
EzmlmForum.prototype.addLinks = function(text) {
	text = text.replace(/(https?:\/\/[^ ,\n]+)/gi, '<a href="$1">$1</a>');
	return text;
};
EzmlmForum.prototype.addMedia = function(text) {
	text = this.addNativeMedia(text);
	text = this.addOnlineMediaEmbedding(text);
	return text;
};
EzmlmForum.prototype.addNativeMedia = function(text) {
	// http://techslides.com/demos/sample-videos/small.mp4
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
	return text;
};
EzmlmForum.prototype.addOnlineMediaEmbedding = function(text) {
	return text;
};

/**
 * Thread view management ------------------------------------------------------
 */
function ViewThread() {
	this.threadHash = null;
}
ViewThread.prototype = new EzmlmForum();

ViewThread.prototype.init = function() {
	console.log('ViewThread.init()');
	//console.log(this.config);
	//console.log('Thread: ' + this.threadHash);
	this.readThread();
};

ViewThread.prototype.readThread = function() {
	var lthis = this;
	// thread info
	$.get(this.listRoot + '/threads/' + this.threadHash + '?details', function(data) {
		console.log(data);
		lthis.renderTemplate('thread-info-box', data);
	});
	// thread messages
	$.get(this.listRoot + '/threads/' + this.threadHash + '/messages?contents=true', function(data) {
		console.log(data);
		var messages = data.results;
		for (var i=0; i < messages.length; ++i) {
			messages[i].message_contents.text = lthis.enrichText(messages[i].message_contents.text);
		}
		lthis.renderTemplate('thread-messages', {messages: messages});
	});
};

/**
 * Renders #tpl-{id} template inside #{id} element, using {data}
 */
ViewThread.prototype.renderTemplate = function(id, data) {
	var container = $('#' + id),
		template = $('#tpl-' + id).html(),
		output = Mustache.render(template, data);
	container.html(output);
};

/**
 * List view management --------------------------------------------------------
 */
function ViewList() {
}
ViewList.prototype = new EzmlmForum();

ViewList.prototype.init = function() {
	console.log('ViewList.init()');
	this.showThreads();
};