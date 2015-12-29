<?php

require_once "BaseController.php";

/**
 * "view-list" controller
 * 
 * Shows a mailing-list exploring interface, for the current list : search among
 * threads, messages, authors, latest activity...
 */
class ViewList extends BaseController {

	protected function init() {
		$this->name = "view-list";
	}
}