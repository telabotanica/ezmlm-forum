<script type="text/html" id="tpl-list-threads" >
<table class="list-threads-table table borderless table-hover">
	<thead>
		<tr>
			<th>Sujet</th>
			<th>Auteur</th>
			<th>Messages</th>
			<th>
				{{#sortAsc}}
					<span class="glyphicon glyphicon-chevron-up" aria-hidden="true"></span>
				{{/sortAsc}}
				{{^sortAsc}}
					<span class="glyphicon glyphicon-chevron-down" aria-hidden="true"></span>
				{{/sortAsc}}
				<a href="#" title="{{sortTitle}}" class="tool" id="list-tool-sort-date">Activité</a>
			</th>
		</tr>
	</thead>
	<tbody>
		{{#threads}}
		<tr>
			<td>
				<a href="view-thread/{{subject_hash}}">
					{{subject}}
				</a>
			</td>
			<td>{{first_message.author_name}}</td>
			<td>{{nb_messages}}</td>
			<td>
				<div class="message-date" title="{{last_message.message_date}}">
					{{last_message.message_date_moment}}
				</div>
				
			</td>
		</tr>
		{{/threads}}
	</tbody>
</table>
</script>