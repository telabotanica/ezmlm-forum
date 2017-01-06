<!--<h1>view-thread : <?= $threadHash ?></h1>-->

<div class="container-fluid">
	<div class="row">
		<div id="back-to-list">
			<a title="Retour à la liste"
				class="back-to-list-link glyphicon glyphicon-circle-arrow-left"
				href="<?php echo $rootUri ?>/view-list">
			</a>
		</div>
		<div id="thread-info-box">
			<!-- thread-info-box.tpl -->
		</div>
		<div id="work-indicator">
			<img src="<?php echo $dataRootUri ?>/img/wait.gif" />
		</div>
		<div id="thread-messages">
			<!-- thread-messages.tpl -->
		</div>
	</div>
</div>

<?php
	// {{mustache}} templates
	include $templatesPath . '/thread-messages.tpl';
	include $templatesPath . '/thread-info-box.tpl';
?>

<script type="text/javascript">
	var viewThread = new ViewThread();
	viewThread.setConfig('<?= json_encode($config, JSON_HEX_APOS) ?>');
	viewThread.threadHash = '<?= $threadHash ?>';
	viewThread.init();
</script>