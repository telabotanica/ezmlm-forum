/**
 * List view management
 */
function ViewList() {
	this.detailsData = null;
	this.threadsData = null;
	this.messagesData = null;
	this.mode = null; // "threads" or "messages"
	this.defaultMode = 'threads';
	this.sortDirection = 'desc';
	this.offset = 0;
	this.limit = 10;
	this.searchTerm = null;
}
// inheritance
ViewList.prototype = new EzmlmForum();

ViewList.prototype.init = function() {
	var lthis = this;
	console.log('ViewList.init()');
	//console.log(this.config);
	this.mode = this.defaultMode;
	this.readDetails(function() {
		lthis.showTools();
		lthis.showThreadsOrMessages();
	});
	this.reloadEventListeners();
};


/**
 * Reads the list's details, displays them, and calls cb() or err() at the end
 * respectively if everything went ok or if an error occurred
 */
ViewList.prototype.readDetails = function(cb, err) {
	var lthis = this;
	var infoBoxData = {
		list_name: lthis.config['ezmlm-php'].list
	};
	// list info
	$.get(this.listRoot)
	.done(function(data) {
		lthis.detailsData = data;
		//console.log(lthis.detailsData);
		// display
		lthis.detailsData.first_message.message_date_moment = lthis.momentize(lthis.detailsData.first_message.message_date);
		lthis.detailsData.last_message.message_date_moment = lthis.momentize(lthis.detailsData.last_message.message_date);
		infoBoxData.list = lthis.detailsData;
		// page title
		document.title = lthis.config['ezmlm-php'].list + ' (' + lthis.mode + ') - ' + lthis.config.title;

		lthis.renderTemplate('list-info-box', infoBoxData);
		// bye
		cb();
	})
	.fail(function() {
		console.log('details foirax');
		err();
	});
}

ViewList.prototype.showTools = function() {
	this.renderTemplate('list-tools-box', {
		mode: this.mode
	});
};

ViewList.prototype.showThreadsOrMessages = function() {
	if (this.mode == 'messages') {
		this.readMessages();
	} else {
		this.readThreads();
	}
};

/**
 * Reads, searches, filters latest threads and displays them adequately
 */
ViewList.prototype.readThreads = function() {
	var lthis = this;
	// @TODO wait indicator

	// post-callbacks work
	function displayThreads() {
		// threads
		var threads = lthis.threadsData.results;
		for (var i=0; i < threads.length; ++i) {
			// format dates
			threads[i].last_message.message_date_moment = lthis.momentize(threads[i].last_message.message_date);
		}

		var templateData = {
			threads: threads,
			sortAsc: (lthis.sortDirection == 'asc'),
			sortTitle: (lthis.sortDirection == 'asc' ? "Les plus anciens d'abord" : "Les plus récents d'abord"),
			displayedThreads: lthis.threadsData.count,
			totalThreads: lthis.detailsData.nb_threads,
			moreThreads: (lthis.detailsData.nb_threads - lthis.threadsData.count > 0)
		};
		lthis.renderTemplate('list-threads', templateData);
		lthis.reloadEventListeners();
	}

	// list threads
	var url = this.listRoot + '/threads/'
		+ (this.searchTerm ? 'search/*' + this.searchTerm + '*/' : '')
		+ '?sort=' + this.sortDirection
		+ (this.offset ? '&offset=' + this.offset : '')
		+ (this.limit ? '&limit=' + this.limit : '')
		+ '&details=true';
	$.get(url)
	.done(function(data) {
		lthis.threadsData = data;
		//console.log(lthis.threadsData);
	})
	.fail(function() {
		console.log('threads foirax');
	})
	.always(displayThreads);
};

ViewList.prototype.readMessages = function() {
	var lthis = this;
	// @TODO wait indicator

	// post-callbacks work
	function displayMessages() {
		// messages
		var messages = lthis.messagesData.results;
		for (var i=0; i < messages.length; ++i) {
			// format text
			messages[i].quoted_message_id = lthis.detectQuotedMessageId(messages[i].message_contents.text); // do this before cleaning
			messages[i].message_contents.text = lthis.cleanText(messages[i].message_contents.text);
			messages[i].message_contents.text = lthis.enrichText(messages[i].message_contents.text);
			// format dates
			messages[i].message_date_moment = lthis.momentize(messages[i].message_date);
			// @TODO detect attachments mimetype family and use appropriate
			// glyphicon from Boostrap (video, picture, audio...)
			// detect original author
			messages[i].from_original_author = (lthis.detailsData.thread.first_message.author_hash == messages[i].author_hash);
			// detect first message
			messages[i].is_first_message = (lthis.detailsData.thread.first_message_id == messages[i].message_id);
			// need to explicitely show quote (distance > 1) ?
			messages[i].needs_quotation = (messages[i].quoted_message_id != null) && (messages[i].message_id - messages[i].quoted_message_id > 1);
		}

		var templateData = {
			messages: messages,
			sortAsc: (lthis.sortDirection == 'asc'),
			sortTitle: (lthis.sortDirection == 'asc' ? "Les plus anciens d'abord" : "Les plus récents d'abord"),
			displayedMessages: lthis.messagesData.count,
			totalMessages: lthis.detailsData.thread.nb_messages,
			moreMessages: (lthis.detailsData.thread.nb_messages - lthis.messagesData.count > 0)
		};
		lthis.renderTemplate('list-messages', templateData);
		lthis.reloadEventListeners();
	}

	// list messages
	var url = this.listRoot + '/messages/'
		+ '&sort=' + this.sortDirection
		+ (this.offset ? '&offset=' + this.offset : '')
		+ (this.limit ? '&limit=' + this.limit : '')
	;
	$.get(url)
	.done(function(data) {
		lthis.messagesData = data;
		console.log(lthis.messagesData);
	})
	.fail(function() {
		console.log('messages foirax');
	})
	.always(displayMessages);
};

/**
 * Redefines all event listeners for view-thread page; to be called after any
 * event-prone content has been loaded
 */
ViewList.prototype.reloadEventListeners = function() {
	var lthis = this;
	console.log('reload list event listeners !');

	// show thread details
	$('.list-tool-info-details').unbind().click(function() {
		// @TODO use closest() to genericize for multiple instances ?
		$('.list-info-box-details').toggle();
	});

	// sort messages / threads by date
	$('#list-tool-sort-date').unbind().click(function() {
		lthis.sortByDate();
	});

	// search messages / threads
	$('#list-tool-search').unbind().click(function() {
		lthis.search();
	});
	// press Return to search
	$('#list-tool-search-input').unbind().keypress(function(e) {
		if (e.which == 13) { // "return" key
			lthis.search();
		}
	});
};

ViewList.prototype.sortByDate = function() {
	console.log('sort by date');
	this.sortDirection = (this.sortDirection == 'desc' ? 'asc' : 'desc');
	this.offset = 0;
	// refresh messages + tools template
	this.showThreadsOrMessages();
};

ViewList.prototype.search = function() {
	var term = $('#list-tool-search-input').val();
	this.searchTerm = term;
	this.showThreadsOrMessages();
};
