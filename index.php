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
		<!--<script src="bower_components/bootstrap/dist/js/bootstrap.min.js"></script>-->
		<script src="<?= $fc->getRootUri() ?>/bower_components/moment/min/moment.min.js"></script>
		<script src="<?= $fc->getRootUri() ?>/bower_components/moment/locale/fr.js"></script>
		<script src="<?= $fc->getRootUri() ?>/bower_components/mustache.js/mustache.min.js"></script>
		<link rel="stylesheet" type="text/css" href="<?= $fc->getRootUri() ?>/bower_components/bootstrap/dist/css/bootstrap.min.css" />

		<!-- local resources -->
		<script type="text/javascript" src="<?= $fc->getRootUri() ?>/js/ezmlm-forum.js"></script>
		<link rel="stylesheet" type="text/css" href="<?= $fc->getRootUri() ?>/css/ezmlm-forum.css" />
	</head>
	<body>
		<?php $fc->renderPage(); ?>
	</body>
</html>