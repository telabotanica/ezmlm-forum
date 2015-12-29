<?php
	require "ezmlm-forum.php";
	$fc = new EzmlmForum(); // front controller
?>
<!DOCTYPE HTML>
<html>
	<head>
		<meta charset="UTF-8" />
		<title><?= $fc->config['title'] ?></title>
		<script type="text/javascript" src=""></script>
		<link rel="stylesheet" type="text/css" href="" />
	</head>
	<body>
		<?php $fc->renderPage(); ?>
	</body>
</html>