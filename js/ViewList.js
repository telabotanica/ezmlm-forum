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

ViewList.prototype.initDefaults = function() {
	console.log('ViewList.initDefaults()');
	this.mode = this.defaultMode;
	this.sortDirection = this.defaultSortDirection;
};

/**
 * Reads the list's details, displays them, and calls cb() or err() at the end
 * respectively if everything went ok or if an error occurred
 */
ViewList.prototype.readDetails = function() {
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
		// email censorship
		lthis.detailsData.first_message.author_name = lthis.censorEmail(lthis.detailsData.first_message.author_name);
		lthis.detailsData.last_message.author_name = lthis.censorEmail(lthis.detailsData.last_message.author_name);

		infoBoxData.list = lthis.detailsData;
		// page title
		document.title = lthis.config['ezmlm-php'].list + ' (' + lthis.mode + ') - ' + lthis.config.title;

		lthis.renderTemplate('list-info-box', infoBoxData);
		// bye
	})
	.fail(function() {
		console.log('details foirax');
	});
}

ViewList.prototype.showTools = function() {
	console.log('render tools !');
	this.renderTemplate('list-tools-box', {
		messagesMode: (this.mode == 'messages'),
		threadsMode: (this.mode == 'threads'),
		searchTerm: this.searchTerm != null ? decodeURI(this.searchTerm) : ''
	});
};

ViewList.prototype.showThreadsOrMessages = function() {
	var lthis = this;
	function done() {
		lthis.stopWorking();
		lthis.pushAppState();
	}
	$('#list-threads').html('');
	$('#list-messages').html('');
	this.startWorking();
	if (this.mode == 'messages') {
		this.readMessages(done);
	} else {
		this.readThreads(done);
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
			// in case the thread name is empty
			if (threads[i].subject == "") threads[i].subject = "-- error reading subject --";
			// email censorship
			threads[i].first_message.author_name = lthis.censorEmail(threads[i].first_message.author_name);
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
			searchTerm: (lthis.searchTerm || '*'),
			sortDirection: lthis.sortDirection,
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
				previousOffset: Math.max(0, lthis.offset - lthis.limit),
				nextOffset: lthis.offset + lthis.limit,
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
			searchTerm: (lthis.searchTerm || '*'),
			sortDirection: lthis.sortDirection,
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
				previousOffset: Math.max(0, lthis.offset - lthis.limit),
				nextOffset: lthis.offset + lthis.limit,
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

ViewList.prototype.search = function() {
	var term = $('#list-tool-search-input').val();
	//console.log('push search: [' + term + ']')
	// search bar should be a form to avoid this trick
	this.pushAppState(this.mode, term, 0);
};

/**
 * Updates URL route-like fragment so that it reflects app state; this is
 * supposed to push a history state (since URL fragment has changed)
 */
ViewList.prototype.pushAppState = function(mode, term, offset, sortDirection) {
	if (term == '') {
		term = '*';
	}
	if (offset == undefined) {
		offset = this.offset;
	}
	var fragment = '#!';
	fragment += '/' + (mode || this.mode);
	fragment += '/' + (term || (this.searchTerm ? this.searchTerm : '*'));
	fragment += '/' + offset;
	fragment += '/' + (sortDirection || this.sortDirection);
	//console.log('pushing framgment: [' + fragment + ']');
	// @TODO date search
	window.location.hash = fragment;
};

/**
 * Reads URL route-like fragment to load app state
 */
ViewList.prototype.readAppState = function() {
	var fragment = window.location.hash;
	//console.log('fragment: [' + fragment + ']');
	var parts = fragment.split('/');
	// remove '#!';
	parts.shift();
	//console.log(parts);
	if (parts.length == 4) { // all or nothing
		this.mode = parts[0];
		this.searchTerm = (parts[1] == '*' ? null : parts[1]);
		console.log('AAAA searchTerm: [' + this.searchTerm + '], nst: [' + (parts[1] == '*' ? null : parts[1]) + ']');
		this.offset = parseInt(parts[2]);
		this.sortDirection = parts[3];
	}
};

/**
 * Reads app state then calls services to update rendering
 * - triggered by hashchange
 */
ViewList.prototype.loadAppStateFromUrl = function() {
	var previousMode = this.mode,
		previousSearchTerm = this.searchTerm,
		previousOffset = this.offset,
		previousSortDirection = this.sortDirection;
	// from URL
	this.readAppState();
	console.log('ViewList.intelligentReload()');
	// intelligent reload
	console.log('searchTerm: [' + this.searchTerm + '], pst: [' + previousSearchTerm + ']');
	var needsDetails = ! this.appLoadedOnce,
		needsTools = (needsDetails || this.mode != previousMode || this.searchTerm != previousSearchTerm),
		needsContents = (needsTools || this.offset != previousOffset || this.sortDirection != previousSortDirection);
	if (needsDetails) {
		console.log('-- reload details');
		this.readDetails();
	}
	if (needsContents) {
		console.log('-- reload contents');
		this.showThreadsOrMessages();
	}
	if (needsTools) {
		console.log('-- reload tools');
		this.showTools();
	}
};
