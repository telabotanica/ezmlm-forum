<script type="text/html" id="tpl-thread-info-box" >
	<h2>{{thread.subject}}</h2>
	<div class="thread-info-box-details">
		créé le {{thread.first_message.message_date}} par {{thread.first_message.author_name}}
		<br/>
		dernier message le {{thread.last_message.message_date}} par {{thread.last_message.author_name}}
	</div>
</script>