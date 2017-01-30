<script type="text/html" id="tpl-list-threads" >
<table class="list-threads-table table borderless table-hover">
	<thead>
		<tr>
			<th class="col-lg-8 col-md-6 col-sm-6 col-xs-7">Sujet</th>
			<th class="col-lg-2 col-md-3 col-sm-3 col-xs-3">Auteur</th>
			<th class="col-lg-1 col-md-1 col-sm-1 col-xs-1" title="Nombre de messages">
				<span class="hidden-xs hidden-sm">Messages</span>
				<span class="hidden-md hidden-lg">Msgs</span>
			</th>
			<th class="col-lg-1 col-md-2 col-sm-2 col-xs-1">
				{{#sortAsc}}
					<span class="glyphicon glyphicon-chevron-up" aria-hidden="true"></span>
					<a href="{{link_base}}/view-list#!/threads/{{searchMode}}/{{searchTerm}}/0/desc" title="{{sortTitle}}" class="tool" id="list-tool-sort-date">
						<span class="hidden-xs">Activité</span>
						<span class="hidden-sm hidden-md hidden-lg">Act</span>
					</a>
				{{/sortAsc}}
				{{^sortAsc}}
					<span class="glyphicon glyphicon-chevron-down" aria-hidden="true"></span>
					<a href="{{link_base}}/view-list#!/threads/{{searchMode}}/{{searchTerm}}/0/asc" title="{{sortTitle}}" class="tool" id="list-tool-sort-date">
						<span class="hidden-xs">Activité</span>
						<span class="hidden-sm hidden-md hidden-lg">Act</span>
					</a>
				{{/sortAsc}}
			</th>
		</tr>
	</thead>
	<tbody>
		{{#threads}}
		<tr>
			<td>
				<a href="{{link_base}}/view-thread/{{subject_hash}}">
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
		{{^threads}}
		<tr>
			<td colspan="4">Aucun sujet ne correspond à la recherche</td>
		</tr>
		{{/threads}}
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
				href="{{link_base}}/view-list#!/threads/{{searchMode}}/{{searchTerm}}/{{previousOffset}}/{{sortDirection}}"></a>
			<a {{^hasNextPages}}disabled {{/hasNextPages}} title="Page suivante" id="list-pager-next-page"
				class="btn btn-primary glyphicon glyphicon-chevron-right"
				href="{{link_base}}/view-list#!/threads/{{searchMode}}/{{searchTerm}}/{{nextOffset}}/{{sortDirection}}"></a>
		</span>
	</div>
	{{/pager}}
</div>
</script>