<?php
	require "ezmlm-forum.php";
	$fc = new EzmlmForum(); // front controller
?>
<!DOCTYPE HTML>
<html>
	<head>
		<meta charset="UTF-8" />
		<title><?= $fc->config['title'] ?></title>

		<!-- bower stuff -->
		<script src="<?= $fc->getRootUri() ?>/bower_components/jquery/dist/jquery.min.js"></script>
		<script src="<?= $fc->getRootUri() ?>/bower_components/bootstrap/dist/js/bootstrap.min.js"></script>
		<script src="<?= $fc->getRootUri() ?>/bower_components/moment/min/moment.min.js"></script>
		<script src="<?= $fc->getRootUri() ?>/bower_components/moment/locale/fr.js"></script>
		<script src="<?= $fc->getRootUri() ?>/bower_components/mustache.js/mustache.min.js"></script>
		<script src="<?= $fc->getRootUri() ?>/bower_components/binette.js/binette.js"></script>
		<link rel="stylesheet" type="text/css" href="<?= $fc->getRootUri() ?>/bower_components/bootstrap/dist/css/bootstrap.min.css" />

		<!-- local resources -->
		<script type="text/javascript" src="<?= $fc->getRootUri() ?>/js/AuthAdapter.js"></script>
		<?php if($fc->getAuthAdapterPath() != ""): ?>
			<script type="text/javascript" src="<?= $fc->getAuthAdapterPath() ?>"></script>
		<?php endif ?>
		<script type="text/javascript" src="<?= $fc->getRootUri() ?>/js/EzmlmForum.js"></script>
		<script type="text/javascript" src="<?= $fc->getRootUri() ?>/js/ViewThread.js"></script>
		<script type="text/javascript" src="<?= $fc->getRootUri() ?>/js/ViewList.js"></script>
		<link rel="stylesheet" type="text/css" href="<?= $fc->getRootUri() ?>/css/ezmlm-forum-standalone.css" />
		<link rel="stylesheet" type="text/css" href="<?= $fc->getRootUri() ?>/css/ezmlm-forum-internal.css" />
	</head>
	<body>
		<div id="ezmlm-forum-main">
			<?php $fc->renderPage(); ?>
		</div>
	</body>
</html>