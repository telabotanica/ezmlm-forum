<script type="text/html" id="tpl-list-tools-box" >
<!--<div class="btn-group" role="group" aria-label="...">
	<button type="button" class="btn btn-default">Left</button>
	<button type="button" class="btn btn-default">Middle</button>
	<button type="button" class="btn btn-default">Right</button>
</div>-->

<div class="row">
	<div class="col-md-4 col-sm-4 col-xs-4">
		<div class="btn-group" role="group">
			<button class="list-tool btn btn-default dropdown-toggle" data-toggle="dropdown">
				Tous les sujets
				<span class="caret"></span>
			</button>
			<ul class="dropdown-menu">
				<li><a href="#">Tous les sujets</a></li>
				<li><a href="#">Tous les messages</a></li>
			</ul>
		</div>
	</div>

	<div class="col-md-6 col-sm-6 col-xs-6">
		<div class="input-group">
		<input type="text" class="form-control" placeholder="Rechercher...">
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