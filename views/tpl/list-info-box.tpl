<script type="text/html" id="tpl-list-info-box" >
	{{^list}}
		erreur: la liste [{{list_name}}] n'existe pas sur ce serveur
	{{/list}}
	{{#list}}
		{{#display_title}}
			<h2 id="list-name"><a href="{{link_base}}/view-list#!/threads/search/*/0/desc">{{list.list_name}}</a></h2>
		{{/display_title}}
		<span class="list-address" title="Vous pouvez écrire directement à cette adresse">{{list.list_address}}</span> -
		<a href="#" class="tool list-tool-info-details">détails</a>
		<div class="list-info-box-details">
			<div class="details-row">
				premier message : <span class="message-date" title="{{list.first_message.message_date}}">{{list.first_message.message_date_moment}}</span>
				par <span class="author-name">{{list.first_message.author_name}}</span>
				<br/>
				&nbsp;&nbsp;(sujet: <a href="{{link_base}}/view-thread/{{list.first_message.subject_hash}}"><span class="thread-name">{{list.first_message.subject}}</span></a>)
			</div>
			<div class="details-row">
				dernier message : <span class="message-date" title="{{list.last_message.message_date}}">{{list.last_message.message_date_moment}}</span>
				par <span class="author-name">{{list.last_message.author_name}}</span>
				<br/>
				&nbsp;&nbsp;(sujet: <a href="{{link_base}}/view-thread/{{list.last_message.subject_hash}}"><span class="thread-name">{{list.last_message.subject}}</span></a>)
			</div>
		</div>
	{{/list}}
</script>