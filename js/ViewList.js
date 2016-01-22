/**
 * List view management
 */
function ViewList() {
	this.detailsData = null;
	this.threadsData = null;
	this.messagesData = null;
	this.mode = null; // "threads" or "messages"
	this.defaultMode = 'threads';
	this.sortDirection = null;
	this.defaultSortDirection = 'desc';
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
	this.sortDirection = this.defaultSortDirection;
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
	console.log('render tools !');
	this.renderTemplate('list-tools-box', {
		messagesMode: (this.mode == 'messages'),
		threadsMode: (this.mode == 'threads'),
		searchTerm: this.searchTerm
	});
};

ViewList.prototype.showThreadsOrMessages = function() {
	var lthis = this;
	$('#list-threads').html('');
	$('#list-messages').html('');
	this.startWorking();
	if (this.mode == 'messages') {
		this.readMessages(function() {
			lthis.stopWorking();
		});
	} else {
		this.readThreads(function() {
			lthis.stopWorking();
		});
	}
};

/**
 * Reads, searches, filters latest threads and displays them adequately; calls
 * cb() at the end
 */
ViewList.prototype.readThreads = function(cb) {
	var lthis = this;
	this.abortQuery(); // if messages are being read, stop it

	// post-callbacks work
	function displayThreads() {
		// threads
		var threads = lthis.threadsData.results;
		for (var i=0; i < threads.length; ++i) {
			// format dates
			threads[i].last_message.message_date_moment = lthis.momentize(threads[i].last_message.message_date);
		}

		var currentPage = 1
			totalPages = Math.floor(lthis.threadsData.total / lthis.limit);
		if (lthis.threadsData.total % lthis.limit != 0) {
			totalPages++;
		}
		if (lthis.offset > 0) {
			currentPage = Math.floor(lthis.offset / lthis.limit) + 1;
		}
		var templateData = {
			threads: threads,
			sortAsc: (lthis.sortDirection == 'asc'),
			sortTitle: (lthis.sortDirection == 'asc' ? "Les plus anciens d'abord" : "Les plus récents d'abord"),
			displayedThreads: lthis.threadsData.count,
			totalThreads: lthis.threadsData.total,
			moreThreads: (lthis.threadsData.total - lthis.threadsData.count > 0),
			pager: {
				currentPage: currentPage,
				totalPages: totalPages,
				hasNextPages: (currentPage < totalPages),
				hasPreviousPages: (currentPage > 1),
				totalResults: lthis.threadsData.total
			}
		};
		lthis.renderTemplate('list-threads', templateData);
		lthis.reloadEventListeners();
		cb();
	}

	// list threads
	var url = this.listRoot + '/threads/'
		+ (this.searchTerm ? 'search/*' + this.searchTerm + '*/' : '')
		+ '?sort=' + this.sortDirection
		+ (this.offset ? '&offset=' + this.offset : '')
		+ (this.limit ? '&limit=' + this.limit : '')
		+ '&details=true';
	this.runningQuery = $.get(url)
	.done(function(data) {
		lthis.threadsData = data;
		//console.log(lthis.threadsData);
	})
	.fail(function() {
		console.log('threads foirax');
	})
	.always(displayThreads);
};


/**
 * Reads, searches, filters latest messages and displays them adequately; calls
 * cb() at the end
 */
ViewList.prototype.readMessages = function(cb) {
	var lthis = this;
	this.abortQuery(); // if threads are being read, stop it

	// post-callbacks work
	function displayMessages() {
		// messages
		var messages = lthis.messagesData.results;
		for (var i=0; i < messages.length; ++i) {
			// format text
			messages[i].message_contents.text = lthis.cleanText(messages[i].message_contents.text);
			// format dates
			messages[i].message_date_moment = lthis.momentize(messages[i].message_date);
		}

		var currentPage = 1
			totalPages = Math.floor(lthis.messagesData.total / lthis.limit);
		if (lthis.messagesData.total % lthis.limit != 0) {
			totalPages++;
		}
		if (lthis.offset > 0) {
			currentPage = Math.floor(lthis.offset / lthis.limit) + 1;
		}
		var templateData = {
			messages: messages,
			sortAsc: (lthis.sortDirection == 'asc'),
			sortTitle: (lthis.sortDirection == 'asc' ? "Les plus anciens d'abord" : "Les plus récents d'abord"),
			displayedMessages: lthis.messagesData.count,
			totalMessages: lthis.messagesData.total,
			moreMessages: (lthis.messagesData.total - lthis.messagesData.count > 0),
			pager: {
				currentPage: currentPage,
				totalPages: totalPages,
				hasNextPages: (currentPage < totalPages),
				hasPreviousPages: (currentPage > 1),
				totalResults: lthis.messagesData.total
			}
		};
		lthis.renderTemplate('list-messages', templateData);
		lthis.reloadEventListeners();
		cb();
	}

	// list messages
	var url = this.listRoot + '/messages/'
		+ (this.searchTerm ? 'search/*' + this.searchTerm + '*/' : '')
		+ '?contents=abstract'
		+ '&sort=' + this.sortDirection
		+ (this.offset ? '&offset=' + this.offset : '')
		+ (this.limit ? '&limit=' + this.limit : '')
	;
	this.runningQuery = $.get(url)
	.done(function(data) {
		lthis.messagesData = data;
		//console.log(lthis.messagesData);
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

	// switch threads / messages
	$('.list-tool-mode-entry').unbind().click(function() {
		var mode = $(this).data('mode');
		lthis.mode = mode;
		lthis.searchTerm = '';
		lthis.sortDirection = lthis.defaultSortDirection;
		lthis.offset = 0;
		lthis.showTools();
		lthis.showThreadsOrMessages();
	});

	// pager
	$('#list-pager-previous-page').unbind().click(function() {
		console.log('previous page');
		lthis.offset = Math.max(0, lthis.offset - lthis.limit);
		lthis.showThreadsOrMessages();
	});
	$('#list-pager-next-page').unbind().click(function() {
		console.log('next page');
		var maxElements = 0;
		if (lthis.mode == "messages") {
			maxElements = lthis.detailsData.nb_messages - 1;
		} else {
			maxElements = lthis.detailsData.nb_threads - 1;
		}
		lthis.offset = Math.min(maxElements, lthis.offset + lthis.limit);
		lthis.showThreadsOrMessages();
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
	this.offset = 0;
	this.searchTerm = term;
	this.showThreadsOrMessages();
};
