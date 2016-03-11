<script type="text/html" id="tpl-thread-info-box" >
	{{^thread}}
		erreur: le thread [{{hash}}] n'existe pas dans cette liste
	{{/thread}}
	{{#thread}}
	<h2>
		{{#thread.subject}}
			{{thread.subject}}
		{{/thread.subject}}
		{{^thread.subject}}
			n/a
		{{/thread.subject}}
	</h2>
	<a href="#" class="tool thread-tool-info-details">détails</a>
	<div class="thread-info-box-details">
		<div class="details-row">
			premier message : <span class="message-date" title="{{thread.first_message.message_date}}">{{thread.first_message.message_date_moment}}</span>
			par <span class="author-name">{{thread.first_message.author_name}}</span>
		</div>
		<div class="details-row">
			dernier message : <span class="message-date" title="{{thread.last_message.message_date}}">{{thread.last_message.message_date_moment}}</span>
			par <span class="author-name">{{thread.last_message.author_name}}</span>
		</div>
	</div>
	{{/thread}}
</script>