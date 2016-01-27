<script type="text/html" id="tpl-list-messages" >
<table class="list-threads-table table borderless table-hover">
	<thead>
		<tr>
			<th class="col-lg-3 col-md-4 col-sm-3 col-xs-3">Sujet</th>
			<th class="col-lg-6 col-md-5 col-sm-4 col-xs-5">Message</th>
			<th class="col-lg-2 col-md-2 col-sm-3 col-xs-3">Auteur</th>
			<th class="col-lg-1 col-md-1 col-sm-2 col-xs-1">
				{{#sortAsc}}
					<span class="glyphicon glyphicon-chevron-up" aria-hidden="true"></span>
					<a href="#!/messages/{{searchMode}}/{{searchTerm}}/0/desc" title="{{sortTitle}}" class="tool" id="list-tool-sort-date">
						<span class="hidden-xs">Activité</span>
						<span class="hidden-sm hidden-md hidden-lg">Act</span>
					</a>
				{{/sortAsc}}
				{{^sortAsc}}
					<span class="glyphicon glyphicon-chevron-down" aria-hidden="true"></span>
					<a href="#!/messages/{{searchMode}}/{{searchTerm}}/0/asc" title="{{sortTitle}}" class="tool" id="list-tool-sort-date">
						<span class="hidden-xs">Activité</span>
						<span class="hidden-sm hidden-md hidden-lg">Act</span>
					</a>
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
		{{^messages}}
		<tr>
			<td colspan="4">Aucun message ne correspond à la recherche</td>
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