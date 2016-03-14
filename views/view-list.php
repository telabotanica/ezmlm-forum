<!--<h1>view-list : <?= $config['ezmlm-php']['list'] ?></h1>-->

<div class="container-fluid">
	<div class="row">
		<div id="list-info-box">
			<!-- list-info-box.tpl -->
		</div>
		<div id="list-tools-box">
			<!-- list-tools-box.tpl -->
		</div>
		<div id="work-indicator">
			<img src="<?php echo $dataRootUri ?>/img/wait.gif" />
		</div>
		<div id="new-thread">
			Create your new thread here !!
		</div>
		<div id="list-threads">
			<!-- list-threads.tpl -->
		</div>
		<div id="list-messages">
			<!-- list-messages.tpl -->
		</div>
	</div>
</div>

<?php
	// {{mustache}} templates
	include $templatesPath . '/list-info-box.tpl';
	include $templatesPath . '/list-tools-box.tpl';
	include $templatesPath . '/list-threads.tpl';
	include $templatesPath . '/list-messages.tpl';
?>

<script type="text/javascript">
	var viewList = new ViewList();
	viewList.setConfig('<?= json_encode($config, JSON_HEX_APOS) ?>');
	viewList.init();
</script>