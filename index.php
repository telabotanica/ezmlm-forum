<?php
	require "ezmlm-forum.php";
	$fc = new EzmlmForum(); // front controller
?>
<!DOCTYPE HTML>
<html>
	<head>
		<meta charset="UTF-8" />
		<title><?= $fc->config['title'] ?></title>
		<script type="text/javascript" src="http://resources.tela-botanica.org/jquery/1.11.1/jquery-1.11.1.min.js"></script>
		<script type="text/javascript" src="<?= $fc->getRootUri() ?>/js/ezmlm-forum.js"></script>
		<link rel="stylesheet" type="text/css" href="http://resources.tela-botanica.org/bootstrap/3.2.0/css/bootstrap.css" />
		<link rel="stylesheet" type="text/css" href="<?= $fc->getRootUri() ?>/css/ezmlm-forum.css" />
	</head>
	<body>
		<?php $fc->renderPage(); ?>
	</body>
</html>