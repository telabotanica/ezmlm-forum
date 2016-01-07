<script type="text/html" id="tpl-thread-messages" >
	<div id="thread-tools">
		<div class="right tools-command">
			{{#sortAsc}}
				<img src="../img/icons/arrow-up.png" />
			{{/sortAsc}}
			{{^sortAsc}}
				<img src="../img/icons/arrow-down.png" />
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
		</div>
	{{/messages}}
</script>