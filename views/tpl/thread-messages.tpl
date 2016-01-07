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
		<div class="thread-message">
			<div class="message-date right" title="{{message_date}}">
				{{message_date_moment}}
			</div>
			<div class="message-author-box">
				<div class="author-image">
					
				</div>
				<span class="author-name">{{author_name}}</span>
			</div>
			<div class="message-contents">
				{{{message_contents.text}}}
			</div>
			<div class="message-bottom-container">
				<div class="message-reply-tools">
					<div class="btn-group">
						<a class="btn btn-default reply-to-message">
							Répondre
						</a>
						<!--<a class="btn btn-default reply-to-message">
							en citant
						</a>-->
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