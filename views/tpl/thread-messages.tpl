<script type="text/html" id="tpl-thread-messages" >
	{{#messages}}
		<div class="thread-message">
			<div class="message-date">
				{{message_date}}
			</div>
			<div class="message-author-box">
				<div class="author-image">
					
				</div>
				<span class="author-name">{{author_name}}</span>
			</div>
			<div class="message-contents">
				{{{message_contents.text}}}
			</div>
		</div>
	{{/messages}}
</script>