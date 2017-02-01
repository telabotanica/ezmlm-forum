/**
 * A basic auth adapter that gives all rights to the user; designed to be
 * "extended" by creating a custom file, like js/auth/AuthAdapterTB.js
 * 
 * The goal is to obtain the current user's email, that will be sent to
 * ezmlm-php to obtain his rights (or null to keep default rights); the rights
 * are stored here but are not meant to be obtained here : EzmlmForum.loadUserInfo()
 * is responsible for this
 */
function AuthAdapter(config) {
	//console.log('AuthAdapter construct()');
	this.config = config;
	// default user has all rights
	// @WARNING doesn't read list's public/private status
	// @TODO factorize readListDeatils() and compute read rights here
	this.user = {
		email: null,
		// those rights are used to slightly modify the user interface; it is
		// read from ezmlm-php in EzmlmForum.loadUserInfo() and is supposed to
		// represent the real rights the user has when calling ezmlm-php
		rights: {
			"read": true,
			"post": true,
			"moderator": true,
			"admin": true
		}
	};
}

/**
 * Loads user status; 
 */
AuthAdapter.prototype.load = function(cb) {
	cb();
};