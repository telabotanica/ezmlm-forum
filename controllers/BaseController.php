<?php

class BaseController {

	/** Pointer to the front controller that initialized the current controller
	    (contains access to config, utilities etc.) */
	protected $fc;

	/** Controller name, used to find associated view file */
	protected $name;

	public function __construct($frontController) {
		$this->fc = $frontController;
		$this->init();
	}

	/**
	 * Child class customization
	 */
	protected function init() {}

	/**
	 * Renders the page by injecting controller data inside a view template
	 */
	public function render() {
		$viewFile = 'views/' . $this->name . '.php';
		if (! file_exists($viewFile)) {
			throw new Exception("view file [$viewFile] is missing");
		}
		// inject data and render template
		$data = $this->buildPageData();
		extract($data);
		ob_start();
		if ((bool) ini_get('short_open_tag') === true) {
			include $viewFile;
		} else {
			$templateCode = file_get_contents($viewFile);
			$this->convertShortTags($templateCode);
			// Evaluating PHP mixed with HTML requires closing the PHP markup opened by eval()
			$templateCode = '?>' . $templateCode;
			echo eval($templateCode);
		}
		// get ouput
		$out = ob_get_contents();
		// get rid of buffer
		@ob_end_clean();

		return $out;
	}

	/**
	 * Returns an array of data to be injected in the view template; each key
	 * will lead to a variable named after it, ie. returning array('stuff' => 3)
	 * will make $stuff available in the template, with a value of 3
	 */
	protected function buildPageData() {
		return array();
	}

	/**
	 * Converts short PHP tags to <?php echo (...) ?> ones
	 */
	protected function convertShortTags(&$templateCode) {
		// Remplacement de tags courts par un tag long avec echo
		$templateCode = str_replace('<?=', '<?php echo ',  $templateCode);
		// Ajout systématique d'un point virgule avant la fermeture php
		$templateCode = preg_replace("/;*\s*\?>/", "; ?>", $templateCode);
	}
}