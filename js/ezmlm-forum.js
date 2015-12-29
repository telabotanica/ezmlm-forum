$(document).ready(function() {
	console.log('Coucou !');
});

/**
 * Convenience parent class gathering config params and utility methods
 */
function EzmlmForum() {
	this.config = {};
	this.listRoot = '';
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
 * Thread view management
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
	$.get(this.listRoot + '/threads/' + this.threadHash + '/messages?contents=true', function(data) {
		console.log(data);
		lthis.displayMessages(data);
	});
};

ViewThread.prototype.displayMessages = function(messages) {
	var container = $('#davos-thread-container'),
		html = '';
	for (var i=0; i < messages.results.length; ++i) {
		html += this.buildThreadMessageBlock(messages.results[i]);
	}
	container.html(html);
};

ViewThread.prototype.buildThreadMessageBlock = function(message) {
	var template = $('#mt-thread-message').html();
	var output = Mustache.render(template, message);
	return output;
};