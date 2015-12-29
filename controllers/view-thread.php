<?php

require_once "BaseController.php";

/**
 * "view-thread" controller
 * 
 * Shows a thread in the form of a bulletin-board discussion
 */
class ViewThread extends BaseController {

	protected function init() {
		$this->name = "view-thread";
	}

	protected function buildPageData() {
		parent::buildPageData();
	}
}