<!--<h1>view-thread : <?= $threadHash ?></h1>-->

<div class="container-fluid">
	<div class="row">
		<div id="thread-info-box">
			<!-- thread-info-box.tpl -->
		</div>
		<div id="thread-tools">
			<label>Show</label>
			<a class="btn">
				most recent first
			</a>
			<a class="btn active">
				oldest first
			</a>
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