/**
 * Thread view management
 */
function ViewThread() {
	this.threadHash = null;
	this.sortDirection = 'asc';
	this.detailsData = null;
	this.messagesData = null;
	this.offset = 0;
	this.initialLimit = 15;
	this.limit = null;
}
// inheritance
ViewThread.prototype = new EzmlmForum();

/**
 * @WARNING @TODO to be factorized in EzmlmForum.init() and use
 * loadAppStateFromUrl() to initialize ViewThread instead - or better, make a
 * single-page app instead of a 2-pages app
 */
ViewThread.prototype.init = function() {
	console.log('ViewThread.init()');
	var lthis = this;
	//console.log(this.config);
	//console.log('Thread: ' + this.threadHash);
	this.limit = this.initialLimit;
	// load user info
	this.loadSSOStatus(function() {
		console.log('SSO chargé');
		lthis.loadUserInfo(function() {
			console.log(lthis.user);
			lthis.readDetails(function() {
				lthis.readThread();
			});
		});
	});
};

/**
 * Reads the thread's details, displays them, and calls cb() or err() at the end
 * respectively if everything went ok or if an error occurred
 */
ViewThread.prototype.readDetails = function(cb) {
	//console.log('read details');
	var lthis = this;
	var infoBoxData = {
		hash: lthis.threadHash
	};

	// thread info
	$.get(this.listRoot + '/threads/' + this.threadHash + '?details')
	.done(function(data) {
		lthis.detailsData = data;
		//console.log(lthis.detailsData);
		// display
		lthis.detailsData.thread.first_message.message_date_moment = lthis.momentize(lthis.detailsData.thread.first_message.message_date);
		lthis.detailsData.thread.last_message.message_date_moment = lthis.momentize(lthis.detailsData.thread.last_message.message_date);
		// email censorship
		lthis.detailsData.thread.first_message.author_name = lthis.censorEmail(lthis.detailsData.thread.first_message.author_name);
		lthis.detailsData.thread.last_message.author_name = lthis.censorEmail(lthis.detailsData.thread.last_message.author_name);

		infoBoxData = lthis.detailsData;
		// page title
		if (lthis.config.title != "") {
			document.title = lthis.detailsData.thread.subject + ' (' + lthis.config['ezmlm-php'].list + ') - ' + lthis.config.title;
		}

		lthis.renderTemplate('thread-info-box', infoBoxData);
		// bye
		cb();
	})
	.fail(function() {
		console.log('details foirax');
		lthis.renderTemplate('thread-info-box', infoBoxData);
	});
};

/**
 * Clears the messages, displays wait animation, waits a few seconds
 * (5 by default) and reloads thread messages, hoping that the newly sent one
 * will be visible (ie. ezmlm-idx had enough time to index it)
 */
ViewThread.prototype.waitAndReadThread = function(seconds) {
	var lthis = this;
	seconds = seconds || 5; // default wait : 5s
	var milliseconds = seconds * 1000;
	$('#thread-messages').html("");
	this.startWorking();
	setTimeout(function() {
		lthis.readThread();
	}, milliseconds);
};

/**
 * Reads all messages in a thread and displays them adequately; be sure to have
 * read thread details data before (at least once)
 */
ViewThread.prototype.readThread = function() {
	//console.log('read thread');
	var lthis = this;
	this.startWorking();

	// post-callbacks work
	function displayThread() {
		// messages
		var messages = lthis.messagesData.results;
		for (var i=0; i < messages.length; ++i) {
			// format text
			if (messages[i].message_contents) {
				messages[i].quoted_message_id = lthis.detectQuotedMessageId(messages[i].message_contents.text); // do this before cleaning
				messages[i].message_contents.text = lthis.cleanText(messages[i].message_contents.text);
				messages[i].message_contents.text = lthis.enrichText(messages[i].message_contents.text);
			}
			// format dates
			messages[i].message_date_moment = lthis.momentize(messages[i].message_date);
			// @TODO detect attachments mimetype family and use appropriate
			// glyphicon from Boostrap (video, picture, audio...)
			// detect original author
			messages[i].from_original_author = (lthis.detailsData.thread.first_message.author_hash == messages[i].author_hash);
			// email censorship
			messages[i].author_name = lthis.censorEmail(messages[i].author_name);
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
			//totalMessages: lthis.detailsData.thread.nb_messages,
			//moreMessages: (lthis.detailsData.thread.nb_messages - lthis.messagesData.count > 0)
			totalMessages: lthis.messagesData.total,
			moreMessages: (lthis.messagesData.total - lthis.messagesData.count > 0),
			noPostRights: (! lthis.user.rights.post)
		}
		lthis.renderTemplate('thread-messages', templateData);

		// other
		lthis.stopWorking();
		lthis.reloadEventListeners();
	}

	// thread messages
	var url = this.listRoot + '/threads/' + this.threadHash + '/messages?contents=true'
		+ '&sort=' + this.sortDirection
		+ (this.offset ? '&offset=' + this.offset : '')
		+ (this.limit ? '&limit=' + this.limit : '');

	$.get(url)
	.done(function(data) {
		lthis.messagesData = data;
		//console.log(lthis.messagesData);
	})
	.fail(function() {
		console.log('messages foirax');
	})
	.always(displayThread);
};

/**
 * Redefines all event listeners for view-thread page; to be called after any
 * event-prone content has been loaded
 */
ViewThread.prototype.reloadEventListeners = function() {
	var lthis = this;
	console.log('reload thread event listeners !');

	// sort messages by date
	$('#thread-tool-sort-date').unbind().click(function() {
		lthis.sortByDate();
	});

	// show thread details
	$('.thread-tool-info-details').unbind().click(function() {
		// @TODO use closest() to genericize for multiple instances ?
		$('.thread-info-box-details').toggle();
	});

	// load more messages
	$('.load-more-messages').unbind().click(function() {
		lthis.loadMoreMessages();
	});

	// show reply area
	$('.reply-to-message').unbind().click(function() {
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
	$('.cancel-reply').unbind().click(function() {
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
	$('.send-reply').unbind().click(function() {
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
			//console.log(lthis.addQuoteToOutgoingMessage(replyArea.val(), messageId));
			var messageContentsRawText = lthis.addQuoteToOutgoingMessage(replyArea.val(), messageId);
			var message = {
				body: messageContentsRawText.replace(/\n/g,'<br/>'), // @TODO support HTML in editor for real
				body_text: messageContentsRawText,
				html: false
				// @TODO support attachments
			};
			console.log(message);
			$.post(lthis.listRoot + '/threads/' + lthis.threadHash + '/messages', JSON.stringify(message))
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
				// minimalist way of waiting a little for the new message to be
				// archived by ezmlm
				lthis.waitAndReadThread(3);
			})
			.fail(function() {
				console.log('post message FOIRAX');
				alert("Erreur lors de l'envoi du message");
			});

		}
	});

	// read more
	$('.message-read-more').unbind().click(function(e) {
		e.preventDefault();
		$(this).parent().find('.message-read-more-contents').toggle();
		return false;
	});
};

ViewThread.prototype.sortByDate = function() {
	console.log('sort by date');
	this.sortDirection = (this.sortDirection == 'desc' ? 'asc' : 'desc');
	this.limit = this.initialLimit;
	// refresh messages + tools template
	this.readThread();
};

ViewThread.prototype.loadMoreMessages = function() {
	console.log('loadMoreMessages');
	this.limit = null;
	// refresh messages + tools template
	this.readThread();
};

ViewThread.prototype.addQuoteToOutgoingMessage = function(message, quotedMessageId) {
	message += "\n\n";
	message += "++++++" + quotedMessageId + "++++++";
	message += "\n";
	return message;
};

ViewThread.prototype.detectQuotedMessageId = function(text) {
	var quotedId = null,
		pattern = /\+\+\+\+\+\+([0-9]+)\+\+\+\+\+\+/;
	// ^ and $ don't work here => wtf ?
	// Search only one pattern from the beggining, which should be the latest
	// quotation, ignoring quotations present in messages replies not yet cleaned

	var matches = pattern.exec(text);
	if (matches != null && matches.length == 2) {
		quotedId = matches[1];
	}
	return quotedId;
};