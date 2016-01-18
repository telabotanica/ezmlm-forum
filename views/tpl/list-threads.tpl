<script type="text/html" id="tpl-list-threads" >
<table class="list-threads-table table borderless table-hover">
	<thead>
		<tr>
			<th>Sujet</th>
			<th>Auteur</th>
			<th>Messages</th>
			<th>Activité</th>
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