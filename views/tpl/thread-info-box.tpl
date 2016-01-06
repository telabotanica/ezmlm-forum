<script type="text/html" id="tpl-thread-info-box" >
	<h2>{{thread.subject}}</h2> - {{thread.nb_messages}} messages
	Créé le {{thread.first_message.message_date}} par {{thread.first_message.author_name}}
	<br/>
	Dernier message le {{thread.last_message.message_date}} par {{thread.last_message.author_name}}
</script>