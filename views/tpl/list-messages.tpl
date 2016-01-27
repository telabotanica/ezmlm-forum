<script type="text/html" id="tpl-list-messages" >
<table class="list-threads-table table borderless table-hover">
	<thead>
		<tr>
			<th>Sujet</th>
			<th>Message</th>
			<th>Auteur</th>
			<th>
				{{#sortAsc}}
					<span class="glyphicon glyphicon-chevron-up" aria-hidden="true"></span>
					<a href="#!/messages/{{searchMode}}/{{searchTerm}}/0/desc" title="{{sortTitle}}" class="tool" id="list-tool-sort-date">Activité</a>
				{{/sortAsc}}
				{{^sortAsc}}
					<span class="glyphicon glyphicon-chevron-down" aria-hidden="true"></span>
					<a href="#!/messages/{{searchMode}}/{{searchTerm}}/0/asc" title="{{sortTitle}}" class="tool" id="list-tool-sort-date">Activité</a>
				{{/sortAsc}}
			</th>
		</tr>
	</thead>
	<tbody>
		{{#messages}}
		<tr>
			<td>
				<a href="view-thread/{{subject_hash}}">
					{{subject}}
				</a>
			</td>
			<td>
				<a href="view-thread/{{subject_hash}}#msg-{{message_id}}">
					{{message_contents.text}}
				</a>
			</td>
			<td>{{author_name}}</td>
			<td>
				<div class="message-date" title="{{message_date}}">
					{{message_date_moment}}
				</div>
			</td>
		</tr>
		{{/messages}}
	</tbody>
</table>
<div class="list-pager-area">
	{{#pager}}
	<div id="list-threads-pager" class="list-pager">
		<span class="list-pager-total-results">
			{{totalResults}} résultats
		</span>
		{{#totalPages}}
			<span class="list-pager-page-number">
				- page {{currentPage}} / {{totalPages}}
			</span>
		{{/totalPages}}
		<span class="list-pager-navigation">
			<a {{^hasPreviousPages}}disabled {{/hasPreviousPages}} title="Page précédente" id="list-pager-previous-page"
				class="btn btn-primary glyphicon glyphicon-chevron-left"
				href="#!/messages/{{searchMode}}/{{searchTerm}}/{{previousOffset}}/{{sortDirection}}"></a>
			<a {{^hasNextPages}}disabled {{/hasNextPages}} title="Page suivante" id="list-pager-next-page"
				class="btn btn-primary glyphicon glyphicon-chevron-right"
				href="#!/messages/{{searchMode}}/{{searchTerm}}/{{nextOffset}}/{{sortDirection}}"></a>
		</span>
	</div>
	{{/pager}}
</div>
</script>