<?php
	// Fichier amorce pour intégrer le forum dans une page Wordpress
	require "ezmlm-forum.php";
	$fc = new EzmlmForum(); // front controller

	// - ajouter les JS et CSS
	// - définir le titre
	// - inclure le corps de page
	$fc->renderPage();
?>