<script type="text/html" id="tpl-list-tools-box" >
<!--
	<span class="hidden-md hidden-sm hidden-xs">LG</span>
	<span class="hidden-lg hidden-sm hidden-xs">MD</span>
	<span class="hidden-md hidden-lg hidden-xs">SM</span>
	<span class="hidden-md hidden-sm hidden-lg">XS</span>
-->
<div class="row">
	<div class="col-lg-3 col-md-4 col-sm-4 col-xs-4">
		<div class="btn-group" role="group">
			<button class="list-tool btn btn-primary dropdown-toggle" data-toggle="dropdown">
				<span id="list-tool-mode-selected">
					{{#messagesMode}}
					<span class="hidden-sm hidden-md hidden-lg glyphicon glyphicon-envelope"></span>
					<span class="hidden-xs">
						<span class="hidden-sm">tous les </span>messages
					</span>
					{{/messagesMode}}
					{{#threadsMode}}
					<span class="hidden-sm hidden-md hidden-lg glyphicon glyphicon-comment"></span>
					<span class="hidden-xs">
						<span class="hidden-sm">tous les </span>sujets
					</span>
					{{/threadsMode}}
				</span>
				<span class="caret hidden-xs"></span>
			</button>
			<ul class="dropdown-menu">
				<li><a class="list-tool-mode-entry" href="#!/threads/search/*/0/desc">
					<span class="hidden-sm hidden-xs">tous les </span>sujets
				</a></li>
				<li><a class="list-tool-mode-entry" href="#!/messages/search/*/0/desc">
					<span class="hidden-sm hidden-xs">tous les </span>messages
				</a></li>
			</ul>
		</div>
		<div class="btn-group" role="group">
			<button class="list-tool btn btn-default dropdown-toggle" data-toggle="dropdown">
				<span class="glyphicon glyphicon-calendar hidden-sm hidden-md hidden-lg"></span>
				{{#textSearchMode}}
				<span class="hidden-xs">
					<span class="hidden-sm">par </span>date
				</span>
				{{/textSearchMode}}
				{{^textSearchMode}}
					<span class="hidden-xs">{{searchTerm}}</span>
				{{/textSearchMode}}
				<span class="caret hidden-xs"></span>
			</button>
			<ul class="dropdown-menu list-calendar-list">
				<li>
					<div id="list-calendar">
						<table class="table table-striped">
							<thead>
								<tr>
									<th></th>
									<th>Jan</th><th>Fév</th><th>Mar</th><th>Avr</th>
									<th>Mai</th><th>Jun</th><th>Jul</th><th>Aoû</th>
									<th>Sep</th><th>Oct</th><th>Nov</th><th>Déc</th>
								</tr>
							</thead>
							<tbody>
								{{#calendar}}
								<tr>
									<td class="list-calendar-year">{{year}}</td>
									{{#months}}
									<td>
										<a href="#!/messages/date/{{yearAndMonth}}/0/desc"
										   title="voir tous les messages de {{month}}/{{year}}">
											{{count}}
										</a>
									</td>
									{{/months}}
								</tr>
								{{/calendar}}
							</tbody>
						</table>
					</div>
				</li>
			</ul>
		</div>
	</div>

	<div class="col-lg-7 col-md-6 col-sm-7 col-xs-6">
		<div class="input-group">
			<input id="list-tool-search-input" type="text" class="form-control"
				   placeholder="Rechercher..." value="{{#textSearchMode}}{{searchTerm}}{{/textSearchMode}}" />
			<span class="input-group-btn">
				<button id="list-tool-search" class="list-tool btn btn-default glyphicon glyphicon-search"></button>
			</span>
		</div>
	</div>

	<div class="col-lg-2 col-md-2 col-sm-1 col-xs-2 right">
		<button title="Créer un nouveau sujet de discussion"
			{{#noPostRights}}disabled{{/noPostRights}}
			class="hidden-md hidden-lg list-tool btn btn-success right glyphicon glyphicon-plus list-tool-new-thread">
		</button>
		<button title="Créer un nouveau sujet de discussion"
			{{#noPostRights}}disabled{{/noPostRights}}
			class="hidden-sm hidden-xs list-tool btn btn-success right list-tool-new-thread">
			Nouveau sujet
		</button>
	</div>
</div>
</script>