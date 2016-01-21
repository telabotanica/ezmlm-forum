<script type="text/html" id="tpl-list-tools-box" >

<div class="row">
	<div class="col-md-4 col-sm-4 col-xs-4">
		<div class="btn-group" role="group">
			<button class="list-tool btn btn-default dropdown-toggle" data-toggle="dropdown">
				<span id="list-tool-mode-selected">
					{{#messagesMode}}
						Tous les messages
					{{/messagesMode}}
					{{#threadsMode}}
						Tous les sujets
					{{/threadsMode}}
				</span>
				<span class="caret"></span>
			</button>
			<ul class="dropdown-menu">
				<li><a class="list-tool-mode-entry" data-mode="threads" href="#">Tous les sujets</a></li>
				<li><a class="list-tool-mode-entry" data-mode="messages" href="#">Tous les messages</a></li>
			</ul>
		</div>
	</div>

	<div class="col-md-6 col-sm-6 col-xs-6">
		<div class="input-group">
			<input id="list-tool-search-input" type="text" class="form-control"
				   placeholder="Rechercher..." value="{{searchTerm}}" />
			<!--<span id="searchclear" class="glyphicon glyphicon-remove-circle"></span>-->
			<span class="input-group-btn">
				<button id="list-tool-search" class="list-tool btn btn-default glyphicon glyphicon-search"></button>
			</span>
		</div>
	</div>

	<div class="col-md-2 col-sm-2 col-xs-2">
		<button title="Créer un nouveau sujet de discussion"
			class="list-tool btn btn-success right glyphicon glyphicon-plus">
		</button>
	</div>
</div>
</script>