<script type="text/html" id="tpl-thread-messages" >
	<div id="thread-tools">
		<div class="right tools-command">
			{{#sortAsc}}
				<span class="glyphicon glyphicon-chevron-up" aria-hidden="true"></span>
			{{/sortAsc}}
			{{^sortAsc}}
				<span class="glyphicon glyphicon-chevron-down" aria-hidden="true"></span>
			{{/sortAsc}}
			<a href="#" title="{{sortTitle}}" class="tool" id="thread-tool-sort-date">Date</a>
		</div>
	</div>
	{{#messages}}
		{{#is_first_message}}
			<div class="thread-message first-message" id="msg-{{message_id}}">
		{{/is_first_message}}
		{{^is_first_message}}
			<div class="thread-message" id="msg-{{message_id}}">
		{{/is_first_message}}
			<div class="message-date right" title="{{message_date}}">
				{{message_date_moment}}
			</div>
			<div class="message-author-box">
				<div class="author-image">
					<img src="../img/avatar_2.png" />
				</div>
				<!-- author name -->
				{{#from_original_author}}
					<div class="author-name original-author" title="Auteur à l'origine de la discussion">
				{{/from_original_author}}
				{{^from_original_author}}
					<div class="author-name">
				{{/from_original_author}}
					{{#author_name}}
						{{author_name}}
					{{/author_name}}
					{{^author_name}}n/a{{/author_name}}
				</div>
				
				<!-- author / message badges -->
				<div class="message-badges">
					{{#is_first_message}}
						<!--<span title="Premier message de la discussion">°1</span>-->
						<span title="Premier message de la discussion" class="badge-first-message glyphicon glyphicon-flag"></span>
					{{/is_first_message}}
					{{#needs_quotation}}
						<!-- what if quoted message is not currently displayed (too old) ? -->
						<a href="#msg-{{quoted_message_id}}" title="Montrer le message cité" class="badge-show-quoted-message glyphicon glyphicon-comment"></a>
					{{/needs_quotation}}
				</div>
			</div>
			<div class="message-contents">
				{{#message_contents.text}}
					{{{message_contents.text}}}
				{{/message_contents.text}}
				{{^message_contents.text}}
					-- message empty or error reading message --
				{{/message_contents.text}}
			</div>
			<div class="message-bottom-container">
				<div class="message-reply-tools" data-id="{{message_id}}">
					<div class="btn-group">
						<a class="btn btn-default reply-to-message glyphicon glyphicon-share-alt" title="Répondre">
						</a>
						<a class="btn btn-default cancel-reply glyphicon glyphicon-remove" title="Annuler la réponse">
						</a>
						<a class="btn btn-default send-reply glyphicon glyphicon-envelope" title="Envoyer votre réponse">
						</a>
					</div>
				</div>
				<div class="message-attachments">
					{{#message_contents.attachments.length}}
						<ul class="attachments-list">
							{{#message_contents.attachments}}
								<li class="message-attachment">
									<span class="tools-command glyphicon glyphicon-paperclip" aria-hidden="true"></span>
									<a href="{{href}}" class="message-attachment-link">
										{{filename}}
									</a>
								</li>
							{{/message_contents.attachments}}
						</ul>
					{{/message_contents.attachments.length}}
				</div>
			</div>
			<textarea placeholder="Saisissez votre réponse ici" class="reply-area" id="reply-to-message-{{message_id}}"></textarea>
		</div>
	{{/messages}}
	<div class="post-messages-tools">
		{{#moreMessages}}
			<a class="right btn btn-primary load-more-messages">
				{{displayedMessages}} / {{totalMessages}} messages - cliquer pour charger tout
			</a>
		{{/moreMessages}}
		{{^moreMessages}}
			<a class="right btn btn-primary">
				{{displayedMessages}} / {{totalMessages}} messages
			</a>
		{{/moreMessages}}
	</div>
</script>