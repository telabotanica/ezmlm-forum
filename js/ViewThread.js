/**
 * Thread view management
 */
function ViewThread() {
	this.threadHash = null;
	this.sortDirection = 'asc';
	this.detailsData = null;
	this.messagesData = null;
	this.offset = 0;
	this.initialLimit = 3;
	this.limit = null;
	this.avatarCache = {};
}
// inheritance
ViewThread.prototype = new EzmlmForum();

/**
 * @WARNING @TODO to be factorized in EzmlmForum.init() and use
 * loadAppStateFromUrl() to initialize ViewThread instead - or better, make a
 * single-page app instead of a 2-pages app
 */
ViewThread.prototype.init = function() {
	//console.log('ViewThread.init()');
	var lthis = this;
	//console.log(this.config);
	//console.log('Thread: ' + this.threadHash);
	this.limit = this.initialLimit;
	// load aut and user info
	this.auth = new AuthAdapter(this.config);
	this.auth.load(function() {
		//console.log('auth chargée');
		lthis.loadUserInfo(function() {
			//console.log(lthis.auth.user);
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
		link_base: lthis.linkBase,
		hash: lthis.threadHash
	};

	// thread info
	$jq.get(this.listRoot + '/threads/' + this.threadHash + '?details')
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
		if (lthis.config.rewritePageTitle) {
			document.title = lthis.detailsData.thread.subject + ' (' + lthis.config['ezmlm-php'].list + ') - ' + lthis.config.title;
		} else {
			document.title += ' - ' + lthis.detailsData.thread.subject;
		}

		lthis.renderTemplate('thread-info-box', infoBoxData);
		// bye
		cb();
	})
	.fail(function() {
		console.log('failed to fetch details');
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
	$jq('#thread-messages').html("");
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
				if (messages[i].message_contents.text) {
					messages[i].quoted_message_id = lthis.detectQuotedMessageId(messages[i].message_contents.text); // do this before cleaning
					messages[i].message_contents.text = lthis.cleanText(messages[i].message_contents.text);
					// censor all email adresses in the message
					// @TODO maybe apply to quoted messages headers only ?
					messages[i].message_contents.text = lthis.censorEmail(messages[i].message_contents.text, true);
					messages[i].message_contents.text = lthis.enrichText(messages[i].message_contents.text);
				}

				if (messages[i].message_contents.html){
					messages[i].quoted_message_id = lthis.detectQuotedMessageId(messages[i].message_contents.html); // do this before cleaning
					messages[i].message_contents.html = lthis.cleanText(messages[i].message_contents.html);
					// censor all email adresses in the message
					// @TODO maybe apply to quoted messages headers only ?
					messages[i].message_contents.html = lthis.censorEmail(messages[i].message_contents.html, true);
					messages[i].message_contents.html = lthis.enrichText(messages[i].message_contents.html);
				}
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
			link_base: lthis.linkBase,
			sortAsc: (lthis.sortDirection == 'asc'),
			sortTitle: (lthis.sortDirection == 'asc' ? "Les plus anciens d'abord" : "Les plus récents d'abord"),
			displayedMessages: lthis.messagesData.count,
			//totalMessages: lthis.detailsData.thread.nb_messages,
			//moreMessages: (lthis.detailsData.thread.nb_messages - lthis.messagesData.count > 0)
			totalMessages: lthis.messagesData.total,
			moreMessages: (lthis.messagesData.total - lthis.messagesData.count > 0),
			noPostRights: (! lthis.auth.user.rights.post)
		};
		lthis.renderTemplate('thread-messages', templateData);

		// other
		lthis.stopWorking();
		lthis.reloadEventListeners();
		// fetch avatars
		lthis.fetchAvatars();
	}

	// thread messages
	var url = this.listRoot + '/threads/' + this.threadHash + '/messages?contents=true'
		+ '&sort=' + this.sortDirection
		+ (this.offset ? '&offset=' + this.offset : '')
		+ (this.limit ? '&limit=' + this.limit : '');

	$jq.get(url)
	.done(function(data) {
		lthis.messagesData = data;
		//console.log(lthis.messagesData);
	})
	.fail(function() {
		console.log('failed to fetch messages');
	})
	.always(displayThread);
};

/**
 * Redefines all event listeners for view-thread page; to be called after any
 * event-prone content has been loaded
 */
ViewThread.prototype.reloadEventListeners = function() {
	var lthis = this;
	//console.log('reload thread event listeners !');

	// sort messages by date
	$jq('#thread-tool-sort-date').unbind().click(function(e) {
		e.preventDefault();
		lthis.sortByDate();
		return false;
	});

	// show thread details
	$jq('.thread-tool-info-details').unbind().click(function(e) {
		e.preventDefault();
		// @TODO use closest() to genericize for multiple instances ?
		$jq('.thread-info-box-details').toggle();
		return false;
	});

	// load more messages
	$jq('.load-more-messages').unbind().click(function(e) {
		e.preventDefault();
		lthis.loadMoreMessages();
		return false;
	});

	// show reply area
	$jq('.reply-to-message').unbind().click(function(e) {
		e.preventDefault();
		var messageId = $jq(this).parent().parent().data("id");
		//console.log('reply to message #' + messageId);
		var replyArea = $jq('#reply-to-message-' + messageId),
			replyButton = $jq(this),
			sendButton = $jq(this).parent().find('.send-reply'),
			cancelButton = $jq(this).parent().find('.cancel-reply');
		// show reply area
		replyArea.show();
		// hide reply button
		replyButton.hide()
		// show send / cancel buttons
		sendButton.show();
		cancelButton.show();
		return false;
	});

	// cancel a reply
	$jq('.cancel-reply').unbind().click(function(e) {
		e.preventDefault();
		var messageId = $jq(this).parent().parent().data("id");
		//console.log('cancel reply to message #' + messageId);
		var replyArea = $jq('#reply-to-message-' + messageId),
			replyButton = $jq(this).parent().find('.reply-to-message'),
			sendButton = $jq(this).parent().find('.send-reply'),
			cancelButton = $jq(this),
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
		return false;
	});

	// send a reply
	$jq('.send-reply').unbind().click(function(e) {
		e.preventDefault();
		var messageId = $jq(this).parent().parent().data("id");
		//console.log('send reply to message #' + messageId);
		var replyArea = $jq('#reply-to-message-' + messageId),
			replyButton = $jq(this).parent().find('.reply-to-message'),
			sendButton = $jq(this),
			cancelButton = $jq(this).parent().find('.cancel-reply'),
			doSend = false;

		//console.log(replyArea.val());
		if (replyArea.val() != '') {
			doSend = confirm('Envoyer la réponse ?');
		}
		if (doSend) {
			// @TODO post message !
			//console.log('POST !!!!');
			//console.log(lthis.addQuoteToOutgoingMessage(replyArea.val(), messageId));
			var messageContentsRawText = lthis.addQuoteToOutgoingMessage(replyArea.val(), messageId);
			var message = {
				body: lthis.rawMessageToHtml(messageContentsRawText),
				body_text: messageContentsRawText,
				html: true
				// @TODO support attachments
			};
			$jq.post(lthis.listRoot + '/threads/' + lthis.threadHash + '/messages', JSON.stringify(message))
			//console.log(message);
			.done(function() {
				//console.log('post message OK');
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
				console.log('failed to post message');
				alert("Erreur lors de l'envoi du message");
			});

		}
		return false;
	});

	// read more
	$jq('.message-read-more').unbind().click(function(e) {
		e.preventDefault();
		$jq(this).parent().find('.message-read-more-contents').toggle();
		return false;
	});
};

// doesn't work
ViewThread.prototype.addPreviousMessageHtmlQuotation = function(id) {
	var quotation = '';
	// no <br/> because rawMessageToHtml() always leaves at least 2 at the end
	// @TODO do this better, manage languages, test if it works
	quotation += "----- Original message -----<br/>";
	var previousMessage = $jq('#msg-' + id).find('.message-contents').html();
	// remove previous quotations
	previousMessage = previousMessage.replace(/<a.+class="message-read-more".*/gi, '');
	quotation += previousMessage;
	return quotation;
};

ViewThread.prototype.sortByDate = function() {
	//console.log('sort by date');
	this.sortDirection = (this.sortDirection == 'desc' ? 'asc' : 'desc');
	this.limit = this.initialLimit;
	// refresh messages + tools template
	this.readThread();
};

ViewThread.prototype.loadMoreMessages = function() {
	//console.log('loadMoreMessages');
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

/**
 * For every author currently displayed, fetch and display the avatar
 */
ViewThread.prototype.fetchAvatars = function() {
	//console.log("récupération d'avatars !");
	var lthis = this;
	$jq('.thread-message').each(function() {
		var avatar = null;
		var currentElement = $jq(this);
		var messageId = currentElement.attr('id').substr(4);
		// get author email
		var authorEmail = lthis.getAuthorEmailFromMsgId(messageId);
		if (authorEmail != null) {
			// is the avatar already in the cache ?
			if (authorEmail in lthis.avatarCache) {
				//console.log('trouvé dans le cache : ' + lthis.avatarCache[authorEmail]);
				avatar = lthis.avatarCache[authorEmail];
				if (avatar != null) {
					// display it !
					currentElement.find('.author-image > img').attr('src', avatar);
				}
			} else {
				// fetch it using the service, if configured
				if (('avatarService' in lthis.config) && (lthis.config.avatarService != '')) {
					var url = lthis.config.avatarService.replace('{email}', authorEmail);
					var currentThreadMessage = this;
					$jq.getJSON(url)
					.done(function(avatar) {
						//console.log("je l'ai : " + avatar);
						// cache it even if null, to avoid more useless requests
						lthis.avatarCache[authorEmail] = avatar;
						if (avatar != null) {
							// display it !
							$jq(currentThreadMessage).find('.author-image > img').attr('src', avatar);
						}
					})
					.fail(function() {
						console.log('failed to fetch avatar');
						// fallback
						lthis.generateInitialsAvatar(currentElement, messageId);
					});
				} else {
					// fallback
					lthis.generateInitialsAvatar(currentElement, messageId);
				}
			}
		}
	});
};

/**
 * If no avatar was found for this author, tries to generate 2 initials based on
 * his/her name, and associate a (deterministic) background color
 */
ViewThread.prototype.generateInitialsAvatar = function(element, msgId) {
	var initials = this.computeInitials(msgId);

	if (initials) {
		var authorImage = element.find('.author-image');
		authorImage.find('img').attr('src', null);
		authorImage.html(initials);
		var color = this.computeColor(initials);
		authorImage.css('background-color', color);
		authorImage.addClass('author-initials');
	} // else keep the default image
};

/**
 * Generates a 2-letter string of initiales based on an author's name
 * 
 * @param {int} msgId id of the message to retrieve the author from
 * @returns false if it failed, a 2-letter string otherwise
 */
ViewThread.prototype.computeInitials = function(msgId) {
	var authorName = this.getAuthorNameFromMsgId(msgId);
	if (authorName) {
		var pieces = authorName.split(' ');
		//console.log(pieces);
		if (pieces.length >= 2) {
			return pieces[0].substring(0,1) + pieces[1].substring(0,1);
		}
	}
	return false;
};

/**
 * Picks a color among a predefined list, based on a given string (2-letter
 * initials)
 * @TODO choose better colors
 */
ViewThread.prototype.computeColor = function(initials) {
	var colors = ['#F1D133', '#F4754F', '#EAF44F', '#8DE56E', '#6EE5C7', '#89DCEF', '#D7DDFE', '#DABBED', '#FB81E6', '#CECECE'];
	var hash = initials.hashCode();
	var color = colors[hash % colors.length];
	return color;
};

/**
 * Retrieves the author email address given a message id; see getFieldFromMsgId
 */
ViewThread.prototype.getAuthorEmailFromMsgId = function(messageId) {
	return this.getFieldFromMsgId(messageId, 'author_email');
};

/**
 * Retrieves the author name given a message id; see getFieldFromMsgId
 */
ViewThread.prototype.getAuthorNameFromMsgId = function(messageId) {
	return this.getFieldFromMsgId(messageId, 'author_name');
};

/**
 * Retrieves a message field given a message id and the field name;
 * needs to have called readThread() at least once (messagesData must be loaded)
 */
ViewThread.prototype.getFieldFromMsgId = function(messageId, fieldName) {
	var authorEmail = null,
		msgs = this.messagesData.results,
		i = 0;
	while (authorEmail == null && i < msgs.length) {
		if (msgs[i].message_id == messageId) {
			authorEmail = msgs[i][fieldName];
		}
		i++;
	}
	return authorEmail;
};
