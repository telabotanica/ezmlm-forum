<?php
/**
 * Front controller for ezmlm-forum : reads the config, and renders pages using
 * sub-controllers and templates
 */
class EzmlmForum {

	const HREF_BUILD_MODE_REST = "REST";
	const HREF_BUILD_MODE_GET = "GET";

	/** JSON configuration */
	public $config = array();
	public static $CONFIG_PATH = "config/config.json";

	/** Resources (URI elements) */
	protected $resources = array();

	/** Request parameters (GET or POST) */
	protected $params = array();

	/** Domain root (to build URIs) */
	protected $domainRoot;

	/** Shall we build href links using REST-like URIs or GET parameters ? */
	protected $hrefBuildMode;

	/** Base URI (to parse resources) */
	protected $baseURI;

	/** Page to render */
	protected $page;

	/**
	 * Starts the front controller, reads config, parameters and URI fragments
	 */
	public function __construct() {
		// read config
		if (! file_exists(self::$CONFIG_PATH)) {
			throw new Exception("please set a valid config file in [" . self::$CONFIG_PATH . "]");
		}
		$this->config = json_decode(file_get_contents(self::$CONFIG_PATH), true);

		// server config
		$this->domainRoot = $this->config['domainRoot'];
		$this->baseURI = $this->config['baseUri'];

		// initialization
		$this->getHrefBuildMode();
		$this->getResources();
		$this->getParams();

		// read asked page
		$this->getAskedPage();

		// if needed by child classes
		$this->init();
	}

	/** Post-constructor adjustments */
	protected function init() {}

	/**
	 * Returns the base URI after the which JS, CSS etc. files may be invoked
	 */
	public function getRootUri() {
		return $this->domainRoot . $this->baseURI;
	}

	/**
	 * Reads the desired href-links build mode (REST-like URIs or GET parameters)
	 * from the config, or defaults to HREF_BUILD_MODE_REST)
	 */
	protected function getHrefBuildMode() {
		$this->hrefBuildMode = self::HREF_BUILD_MODE_REST;
		if (
			!empty($this->config['hrefBuildMode'])
			&& in_array($this->config['hrefBuildMode'], array(self::HREF_BUILD_MODE_REST,self::HREF_BUILD_MODE_GET))
		) {
			$this->hrefBuildMode = $this->config['hrefBuildMode'];
		}
	}

	/**
	 * Compares request URI to base URI to extract URI elements (resources)
	 */
	protected function getResources() {
		$uri = $_SERVER['REQUEST_URI'];
		// slicing URI
		$baseURI = $this->baseURI . "/";
		if ((strlen($uri) > strlen($baseURI)) && (strpos($uri, $baseURI) !== false)) {
			$baseUriLength = strlen($baseURI);
			$posQM = strpos($uri, '?');
			if ($posQM != false) {
				$resourcesString = substr($uri, $baseUriLength, $posQM - $baseUriLength);
			} else {
				$resourcesString = substr($uri, $baseUriLength);
			}
			// decoding special characters
			$resourcesString = urldecode($resourcesString);
			//echo "Resources: $resourcesString" . PHP_EOL;
			$this->resources = explode("/", $resourcesString);
			// in case of a final /, gets rid of the last empty resource
			$nbRessources = count($this->resources);
			if (empty($this->resources[$nbRessources - 1])) {
				unset($this->resources[$nbRessources - 1]);
			}
		}
	}

	/**
	 * Gets the GET or POST request parameters
	 */
	protected function getParams() {
		$this->params = $_REQUEST;
	}

	/**
	 * Searches for parameter $name in $this->params; if defined (even if
	 * empty), returns its value; if undefined, returns $default
	 */
	protected function getParam($name, $default=null) {
		if (isset($this->params[$name])) {
			return $this->params[$name];
		} else {
			return $default;
		}
	}

	/**
	 * Loads $this->page with the page asked : tries the 1st URI part after
	 * $this->rootUri; if it doesn't exist tries the "page" GET parameter;
	 * then tries $this->config['defaultPage']; finally returns "threads" page
	 */
	protected function getAskedPage() {
		if (count($this->resources) > 0) {
			$this->page = $this->resources[0];
		} elseif ($this->getParam("page") != null) {
			$this->page = $this->getParam("page");
		} elseif (! empty($this->config['defaultPage'])) {
			$this->page = $this->config['defaultPage'];
		} else {
			$this->page = "threads";
		}
	}

	/**
	 * Renders the requested page (specified through URI fragment or GET parameter)
	 */
	public function renderPage() {
		// instanciate page controller
		$pageControllerFile = 'controllers/' . strtolower($this->page) . '.php';
		$pageControllerClass = $this->camelize($this->page);
		if (! file_exists($pageControllerFile)) {
			throw new Exception("page [" . $this->page . "] does not exist, or controller file [$pageControllerFile] is missing");
		}

		// build controller
		require $pageControllerFile;
		$pageController = new $pageControllerClass($this);

		// render page
		echo $pageController->render();
	}

	/**
	 * Transforms a string to a CamelCase version, ex:
	 *   my-string => MyString
	 *   my_other--great.string => MyOtherGreatString
	 * @WARNING : does not manage strings that are already CamelCase thus fails, ex:
	 *   MyString => Mystring
	 *   a-BigBad_camelCase.string => ABigbadCamelcaseString
	 */
	protected function camelize($string) {
		$camelizedString = '';
		$pat = '/[A-Z-._]+/';
		$pieces = preg_split($pat, $string);
		foreach($pieces as $p) {
			$camelizedString .= ucfirst(strtolower($p));
		}
		return $camelizedString;
	}

	public function buildHrefLink($page, $params=array()) {
		throw new Exception('not implemented');
	}
}