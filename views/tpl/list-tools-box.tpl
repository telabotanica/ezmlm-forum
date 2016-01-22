<script type="text/html" id="tpl-list-tools-box" >

	<span class="hidden-md hidden-sm hidden-xs">LG</span>
	<span class="hidden-lg hidden-sm hidden-xs">MD</span>
	<span class="hidden-md hidden-lg hidden-xs">SM</span>
	<span class="hidden-md hidden-sm hidden-lg">XS</span>
<div class="row">
	<div class="col-lg-3 col-md-4 col-sm-3 col-xs-5">
		<div class="btn-group" role="group">
			<button class="list-tool btn btn-primary dropdown-toggle" data-toggle="dropdown">
				<span id="list-tool-mode-selected">
					{{#messagesMode}}
						<span class="hidden-sm hidden-xs">tous les </span>messages
					{{/messagesMode}}
					{{#threadsMode}}
						<span class="hidden-sm hidden-xs">tous les </span>sujets
					{{/threadsMode}}
				</span>
				<span class="caret"></span>
			</button>
			<ul class="dropdown-menu">
				<li><a class="list-tool-mode-entry" data-mode="threads" href="#">
					<span class="hidden-sm hidden-xs">tous les </span>
					sujets
				</a></li>
				<li><a class="list-tool-mode-entry" data-mode="messages" href="#">
					<span class="hidden-sm hidden-xs">tous les </span>messages
				</a></li>
			</ul>
		</div>
		<div class="btn-group" role="group">
			<button class="list-tool btn btn-default dropdown-toggle" data-toggle="dropdown">
				<span class="glyphicon glyphicon-calendar hidden-md hidden-lg"></span>
				<span class="hidden-sm hidden-xs">Par date</span>
				<span class="caret"></span>
			</button>
			<ul class="dropdown-menu">
				<li>Pouet pouet c'est la fête</li>
			</ul>
		</div>
	</div>

	<div class="col-lg-7 col-md-6 col-sm-8 col-xs-5">
		<div class="input-group">
			<input id="list-tool-search-input" type="text" class="form-control"
				   placeholder="Rechercher..." value="{{searchTerm}}" />
			<!--<span id="searchclear" class="glyphicon glyphicon-remove-circle"></span>-->
			<span class="input-group-btn">
				<button id="list-tool-search" class="list-tool btn btn-default glyphicon glyphicon-search"></button>
			</span>
		</div>
	</div>

	<div class="col-lg-2 col-md-2 col-sm-1 col-xs-2 right">
		<button title="Créer un nouveau sujet de discussion"
			class="hidden-md hidden-lg list-tool btn btn-success right glyphicon glyphicon-plus list-tool-new-thread">
		</button>
		<button title="Créer un nouveau sujet de discussion"
			class="hidden-sm hidden-xs list-tool btn btn-success right list-tool-new-thread">
			Nouveau sujet
		</button>
	</div>
</div>
</script>