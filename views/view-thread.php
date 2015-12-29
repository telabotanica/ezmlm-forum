<h1>view-thread : <?= $threadHash ?></h1>

<div id="davos-thread-container">
</div>

<?php
	// {{mustache}} templates
	include $templatesPath . '/thread-message.tpl';
?>

<script type="text/javascript">
	var viewThread = new ViewThread();
	viewThread.setConfig('<?= json_encode($config, JSON_HEX_APOS) ?>');
	viewThread.threadHash = '<?= $threadHash ?>';
	viewThread.init();
</script>