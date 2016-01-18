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
}
// inheritance
ViewList.prototype = new EzmlmForum();

ViewList.prototype.init = function() {
	console.log('ViewList.init()');
	console.log(this.config);
	this.mode = this.defaultMode;
	this.showThreads();
	this.reloadEventListeners();
};

/**
 * Reads, searches, filters latest threads and displays them adequately
 */
ViewList.prototype.showThreads = function() {
	var lthis = this,
		cpt = 2; // callbacks to wait for
	// @TODO wait indicator

	// post-callbacks work
	function next() {
		cpt--;
		if (cpt == 0) {
			console.log('go!');
			var infoBoxData = {
				list_name: lthis.config['ezmlm-php'].list
			};
			// details
			if (lthis.detailsData) {
				lthis.detailsData.first_message.message_date_moment = lthis.momentize(lthis.detailsData.first_message.message_date);
				lthis.detailsData.last_message.message_date_moment = lthis.momentize(lthis.detailsData.last_message.message_date);
				infoBoxData.list = lthis.detailsData;
				// page title
				document.title = lthis.config['ezmlm-php'].list + ' (' + lthis.mode + ') - ' + lthis.config.title;

				if (lthis.mode == 'messages') {
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
					}
					lthis.renderTemplate('list-messages', templateData);
				} else {
					// threads
					var threads = lthis.threadsData.results;
					/*for (var i=0; i < threads.length; ++i) {
						// format text
						threads[i].quoted_message_id = lthis.detectQuotedMessageId(threads[i].message_contents.text); // do this before cleaning
						threads[i].message_contents.text = lthis.cleanText(threads[i].message_contents.text);
						threads[i].message_contents.text = lthis.enrichText(threads[i].message_contents.text);
						// format dates
						threads[i].message_date_moment = lthis.momentize(threads[i].message_date);
						// @TODO detect attachments mimetype family and use appropriate
						// glyphicon from Boostrap (video, picture, audio...)
						// detect original author
						threads[i].from_original_author = (lthis.detailsData.thread.first_message.author_hash == messages[i].author_hash);
						// detect first message
						threads[i].is_first_message = (lthis.detailsData.thread.first_message_id == messages[i].message_id);
						// need to explicitely show quote (distance > 1) ?
						threads[i].needs_quotation = (messages[i].quoted_message_id != null) && (messages[i].message_id - messages[i].quoted_message_id > 1);
					}*/

					var templateData = {
						threads: threads,
						sortAsc: (lthis.sortDirection == 'asc'),
						sortTitle: (lthis.sortDirection == 'asc' ? "Les plus anciens d'abord" : "Les plus récents d'abord"),
						displayedThreads: lthis.threadsData.count,
						totalThreads: lthis.detailsData.nb_threads,
						moreThreads: (lthis.detailsData.nb_threads - lthis.threadsData.count > 0)
					}
					lthis.renderTemplate('list-threads', templateData);
				}
			} // else thread not found

			lthis.renderTemplate('list-info-box', infoBoxData);

			// other
			lthis.reloadEventListeners();
		}
	}

	// list info
	$.get(this.listRoot)
	.done(function(data) {
		lthis.detailsData = data;
		console.log(lthis.detailsData);
	})
	.fail(function() {
		console.log('details foirax');
	})
	.always(next);

	if (this.mode == 'messages') {
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
		.always(next);
	} else {
		// list threads
		var url = this.listRoot + '/threads/?'
			+ 'sort=' + this.sortDirection
			+ (this.offset ? '&offset=' + this.offset : '')
			+ (this.limit ? '&limit=' + this.limit : '')
		;
		$.get(url)
		.done(function(data) {
			lthis.threadsData = data;
			console.log(lthis.threadsData);
		})
		.fail(function() {
			console.log('threads foirax');
		})
		.always(next);
	}
};

/**
 * Redefines all event listeners for view-thread page; to be called after any
 * event-prone content has been loaded
 */
ViewList.prototype.reloadEventListeners = function() {
	var lthis = this;
	console.log('reload list event listeners !');

	// sort messages by date
	$('#thread-tool-sort-date').click(function() {
		lthis.sortByDate();
	});

	// show thread details
	$('.list-tool-info-details').click(function() {
		// @TODO use closest() to genericize for multiple instances ?
		$('.list-info-box-details').toggle();
	});

	// load more messages
	$('.load-more-messages').click(function() {
		lthis.loadMoreMessages();
	});

	// show reply area
	$('.reply-to-message').click(function() {
		var messageId = $(this).parent().parent().data("id");
		//console.log('reply to message #' + messageId);
		var replyArea = $('#reply-to-message-' + messageId),
			replyButton = $(this),
			sendButton = $(this).parent().find('.send-reply'),
			cancelButton = $(this).parent().find('.cancel-reply');
		// show reply area
		replyArea.show();
		// hide reply button
		replyButton.hide()
		// show send / cancel buttons
		sendButton.show();
		cancelButton.show();
	});

	// cancel a reply
	$('.cancel-reply').click(function() {
		var messageId = $(this).parent().parent().data("id");
		//console.log('cancel reply to message #' + messageId);
		var replyArea = $('#reply-to-message-' + messageId),
			replyButton = $(this).parent().find('.reply-to-message'),
			sendButton = $(this).parent().find('.send-reply'),
			cancelButton = $(this),
			doCancel = true;

		if (replyArea.val() != '') {
			doCancel = confirm('Annuler la réponse ?');
		}
		if (doCancel) {
			// hide reply area
			replyArea.val('');
			replyArea.hide();
			// show reply button
			replyButton.show()
			// hide send / cancel buttons
			sendButton.hide();
			cancelButton.hide();
		}
	});

	// send a reply
	$('.send-reply').click(function() {
		var messageId = $(this).parent().parent().data("id");
		//console.log('send reply to message #' + messageId);
		var replyArea = $('#reply-to-message-' + messageId),
			replyButton = $(this).parent().find('.reply-to-message'),
			sendButton = $(this),
			cancelButton = $(this).parent().find('.cancel-reply'),
			doSend = false;

		//console.log(replyArea.val());
		if (replyArea.val() != '') {
			doSend = confirm('Envoyer la réponse ?');
		}
		if (doSend) {
			// @TODO post message !
			console.log('POST !!!!');
			console.log(lthis.addQuoteToOutgoingMessage(replyArea.val(), messageId));
			$.post(lthis.listRoot + '/threads/' + lthis.threadHash + '/messages', {
				message_contents: lthis.addQuoteToOutgoingMessage(replyArea.val(), messageId)
			})
			.done(function() {
				console.log('post message OK');
				// hide reply area
				replyArea.val('');
				replyArea.hide();
				// show reply button
				replyButton.show()
				// hide send / cancel buttons
				sendButton.hide();
				cancelButton.hide();
			})
			.fail(function() {
				console.log('post message FOIRAX');
			});

		}
	});
};
