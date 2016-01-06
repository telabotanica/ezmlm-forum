<!--<h1>view-thread : <?= $threadHash ?></h1>-->

<div class="container-fluid">
	<div class="row">
		<div id="thread-info-box">
			<!-- thread-info-box.tpl -->
		</div>
		<div id="thread-tools">
			<div id="thread-tools-bottombar">
				<div class="right tools-command">
					<img src="img/icons/sort-asc.png" /> <a href="#" class="tool" id="thread-tool-sort-date">Date</a>
				</div>
			</div>
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