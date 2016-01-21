<script type="text/html" id="tpl-list-messages" >
<table class="list-threads-table table borderless table-hover">
	<thead>
		<tr>
			<th>Message</th>
			<th>Auteur</th>
			<th>Sujet</th>
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
		{{#messages}}
		<tr>
			<td>
				<a href="view-thread/{{subject_hash}}/#msg-{{message_id}}">
					{{message_contents.text}}
				</a>
			</td>
			<td>{{author_name}}</td>
			<td>
				<a href="view-thread/{{subject_hash}}">
					{{subject}}
				</a>
			</td>
			<td>
				<div class="message-date" title="{{message_date}}">
					{{message_date_moment}}
				</div>
				
			</td>
		</tr>
		{{/messages}}
	</tbody>
</table>
</script>