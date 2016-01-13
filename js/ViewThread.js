/**
 * Thread view management
 */
function ViewThread() {
	this.threadHash = null;
	this.sortDirection = 'asc';
	this.detailsData = null;
	this.messagesData = null;
	this.offset = 0;
	this.limit = 2;
}
// inheritance
ViewThread.prototype = new EzmlmForum();

ViewThread.prototype.init = function() {
	console.log('ViewThread.init()');
	//console.log(this.config);
	//console.log('Thread: ' + this.threadHash);
	this.readThread();
	this.reloadEventListeners();
};

/**
 * Reads all messages in a thread and displays them adequately
 */
ViewThread.prototype.readThread = function() {
	var lthis = this,
		cpt = 2; // callbacks to wait for
	// @TODO wait indicator

	// post-callbacks work
	function next() {
		cpt--;
		if (cpt == 0) {
			console.log('go!');
			// details
			this.detailsData.thread.first_message.message_date_moment = lthis.momentize(this.detailsData.thread.first_message.message_date);
			this.detailsData.thread.last_message.message_date_moment = lthis.momentize(this.detailsData.thread.last_message.message_date);
			lthis.renderTemplate('thread-info-box', this.detailsData);

			// messages
			var messages = this.messagesData.results;
			for (var i=0; i < messages.length; ++i) {
				// format text
				messages[i].message_contents.text = lthis.cleanText(messages[i].message_contents.text);
				messages[i].message_contents.text = lthis.enrichText(messages[i].message_contents.text);
				// format dates
				messages[i].message_date_moment = lthis.momentize(messages[i].message_date);
				// @TODO detect attachments mimetype family and use appropriate
				// glyphicon from Boostrap (video, picture, audio...)
				// detect original author
				messages[i].from_original_author = (this.detailsData.thread.first_message.author_hash == messages[i].author_hash);
				// detect first message
				messages[i].is_first_message = (this.detailsData.thread.first_message_id == messages[i].message_id);
			}
			lthis.renderTemplate('thread-messages', {
				messages: messages,
				sortAsc: (lthis.sortDirection == 'asc'),
				sortTitle: (lthis.sortDirection == 'asc' ? "Les plus anciens d'abord" : "Les plus récents d'abord"),
				displayedMessages: this.messagesData.count,
				totalMessages: this.detailsData.thread.nb_messages,
				moreMessages: (this.detailsData.thread.nb_messages - this.messagesData.count > 0)
			});

			// other
			lthis.reloadEventListeners();
		}
	}

	// thread info
	$.get(this.listRoot + '/threads/' + this.threadHash + '?details', function(data) {
		detailsData = data;
		console.log(detailsData);
		next();
	});

	// thread messages
	var url = this.listRoot + '/threads/' + this.threadHash + '/messages?contents=true'
		+ '&sort=' + this.sortDirection
		+ (this.offset ? '&offset=' + this.offset : '')
		+ (this.limit ? '&limit=' + this.limit : '');
	$.get(url, function(data) {
		messagesData = data;
		console.log(messagesData);
		next();
	});
};

/**
 * Redefines all event listeners for view-thread page; to be called after any
 * event-prone content has been loaded
 */
ViewThread.prototype.reloadEventListeners = function() {
	var lthis = this;
	console.log('reload event listeners !');

	// sort messages by date
	$('#thread-tool-sort-date').click(function() {
		lthis.sortByDate();
	});

	// show thread details
	$('.thread-tool-info-details').click(function() {
		// @TODO use closest() to genericize for multiple instances ?
		$('.thread-info-box-details').toggle();
	});

	// load more messages
	$('.load-more-messages').click(function() {
		lthis.loadMoreMessages();
	});
};

ViewThread.prototype.sortByDate = function() {
	console.log('sort by date');
	this.sortDirection = (this.sortDirection == 'desc' ? 'asc' : 'desc');
	// refresh messages + tools template
	this.readThread();
};

ViewThread.prototype.loadMoreMessages = function() {
	console.log('loadMoreMessages');
	this.limit = null;
	// refresh messages + tools template
	this.readThread();
};
