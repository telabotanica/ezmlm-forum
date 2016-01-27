/**
 * List view management
 */
function ViewList() {
	this.detailsData = null;
	this.threadsData = null;
	this.messagesData = null;
	this.calendarData = null;
	this.mode = null; // "threads" or "messages"
	this.defaultMode = 'threads';
	this.sortDirection = null;
	this.defaultSortDirection = 'desc';
	this.offset = 0;
	this.limit = 10;
	this.searchMode = null;
	this.searchTerm = null;
}
// inheritance
ViewList.prototype = new EzmlmForum();

ViewList.prototype.initDefaults = function() {
	console.log('ViewList.initDefaults()');
	this.mode = this.defaultMode;
	this.searchMode = "search";
	this.sortDirection = this.defaultSortDirection;
};

/**
 * Reads the list's calendar, displays it under the "by-date" button, calls cb()
 * at the end whatever happens
 */
ViewList.prototype.readCalendar = function(cb) {
	var lthis = this;
	// list info
	var url = this.listRoot + '/calendar';
	$.get(url)
	.done(function(data) {
		lthis.calendarData = data;
	})
	.fail(function() {
		console.log('calendrier foirax');
	})
	.always(function() {
		//console.log('ALWAYS COCA CALLBACK');
		cb();
	});
};

/**
 * Reads the list's details, displays them
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

/**
 * Tools need to read the list calendar - suboptimal cause we could read it
 * only once...
 */
ViewList.prototype.loadTools = function() {
	console.log('load tools and calendar !');
	var lthis = this;
	this.readCalendar(function() {
		// format calendar data for Mustache
		var calendar = [];
		//console.log(lthis.calendarData);
		$.each(lthis.calendarData, function(k, v) {
			var yearData = {
				year: k
			};
			yearData.months = [];
			var allMonths = ["01", "02", "03", "04", "05", "06", "07", "08", "09", "10", "11", "12"];
			for (var i=0; i < allMonths.length; i++) {
				yearData.months.push({
					yearAndMonth: k + '-' + allMonths[i],
					month: allMonths[i],
					count: v[allMonths[i]]
				});
			}
			// sort by month ascending
			yearData.months.sort(function(a, b) {
				return parseInt(a.month) - parseInt(b.month);
			});
			calendar.push(yearData);
		});
		// sort by year descending
		calendar.sort(function(a, b) {
			return parseInt(b.year) - parseInt(a.year);
		});
		console.log(calendar);
		// render
		lthis.renderTemplate('list-tools-box', {
			messagesMode: (lthis.mode == 'messages'),
			threadsMode: (lthis.mode == 'threads'),
			textSearchMode: (lthis.searchMode == 'search'),
			searchTerm: lthis.searchTerm != null ? decodeURI(lthis.searchTerm) : '',
			calendar: calendar,
			mode: lthis.mode,
			urlSearchTerm: (lthis.searchTerm || '*'),
			offset: lthis.offset,
			sortDirection: lthis.sortDirection
		});
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
			// in case some fields are empty or false
			if (threads[i].subject == "") threads[i].subject = "n/a";
			if (! threads[i].first_message.author_name) threads[i].first_message.author_name = "n/a";
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
			searchMode: lthis.searchMode,
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
	var url = this.listRoot + '/threads/';
	if (this.searchTerm) {
		url += this.searchMode + '/';
		var st = this.searchTerm;
		if (this.searchMode == "search") {
			st = '*' + st + '*';
		}
		url += st + '/';
	}
	url += '?sort=' + this.sortDirection
		+ (this.offset ? '&offset=' + this.offset : '')
		+ (this.limit ? '&limit=' + this.limit : '')
		+ '&details=true'
	;
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
			searchMode: lthis.searchMode,
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
	var url = this.listRoot + '/messages/';
	if (this.searchTerm) {
		url += this.searchMode + '/';
		var st = this.searchTerm;
		if (this.searchMode == "search") {
			st = '*' + st + '*';
		}
		url += st + '/';
	}
	url	+= '?contents=abstract'
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
	$('.list-tool-info-details').unbind().click(function(e) {
		// @TODO use closest() to genericize for multiple instances ?
		e.preventDefault();
		$('.list-info-box-details').toggle();
		return false;
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
	this.pushAppState(this.mode, "search", term, 0);
};

/**
 * Updates URL route-like fragment so that it reflects app state; this is
 * supposed to push a history state (since URL fragment has changed)
 */
ViewList.prototype.pushAppState = function(mode, searchMode, searchTerm, offset, sortDirection) {
	if (searchTerm == '') {
		searchTerm = '*';
	}
	if (offset == undefined) {
		offset = this.offset;
	}
	var fragment = '#!';
	fragment += '/' + (mode || this.mode);
	fragment += '/' + (searchMode || this.searchMode);
	fragment += '/' + (searchTerm || (this.searchTerm ? this.searchTerm : '*'));
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
	if (parts.length == 5) { // all or nothing
		this.mode = parts[0];
		this.searchMode = parts[1];
		this.searchTerm = (parts[2] == '*' ? null : parts[2]);
		console.log('AAAA searchTerm: [' + this.searchTerm + '], nst: [' + (parts[2] == '*' ? null : parts[2]) + ']');
		this.offset = parseInt(parts[3]);
		this.sortDirection = parts[4];
	}
};

/**
 * Reads app state then calls services to update rendering
 * - triggered by hashchange
 */
ViewList.prototype.loadAppStateFromUrl = function() {
	var previousMode = this.mode,
		previousSearchMode = this.searchMode,
		previousSearchTerm = this.searchTerm,
		previousOffset = this.offset,
		previousSortDirection = this.sortDirection;

	// from URL
	this.readAppState();
	console.log('ViewList.intelligentReload()');
	// intelligent reload
	console.log('searchTerm: [' + this.searchTerm + '], pst: [' + previousSearchTerm + ']');
	console.log('searchMode: [' + this.searchMode + '], psm: [' + previousSearchMode + ']');
	var needsDetails = ! this.appLoadedOnce,
		needsTools = (needsDetails || this.mode != previousMode || this.searchTerm != previousSearchTerm || this.searchMode != previousSearchMode),
		needsContents = (needsTools || this.offset != previousOffset || this.sortDirection != previousSortDirection);
	if (needsDetails) {
		console.log('-- reload details');
		this.readDetails();
	}
	if (needsTools) {
		console.log('-- reload tools');
		this.loadTools();
	}
	if (needsContents) {
		console.log('-- reload contents');
		this.showThreadsOrMessages();
	}
};
