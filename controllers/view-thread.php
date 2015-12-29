<?php

require_once "BaseController.php";

/**
 * "view-thread" controller
 * 
 * Shows a thread in the form of a bulletin-board discussion
 */
class ViewThread extends BaseController {

	/** ezmlm hash of current thread */
	protected $threadHash;

	protected function init() {
		$this->name = "view-thread";
		$this->getThreadHash();
	}

	protected function getThreadHash() {
		if (! empty($this->fc->resources[1])) {
			$this->threadHash = $this->fc->resources[1];
		} elseif ($this->fc->getParam('thread') != null) {
			$this->threadHash = $this->fc->getParam('thread');
		} else {
			throw new Exception('no thread specified');
		}
	}

	protected function buildPageData() {
		parent::buildPageData();
		$this->data['threadHash'] = $this->threadHash;
		$this->data['templatesBaseUri'] = $this->fc->getRootUri() . '/views/tpl';
	}
}