/*
 * An "extension" of AuthAdapter for Tela Botanica's SSO service
 * @TODO make it a Bower lib !
 */


/**
 * Reads user identity from Tela Botanica SSO service
 * @TODO auto refresh periodically to avoid token expiration
 */
AuthAdapter.prototype.load = function(cb) {
	var lthis = this;
	// get TB auth token
	var authURL = this.config['adapters']['AuthAdapterTB']['annuaireURL'] + '/identite';
	$jq.ajax({
	    url: authURL,
	    type: "GET",
	    dataType: 'json',
	    xhrFields: {
	         withCredentials: true
	    }
	}).done(function(data) {
		var authToken = null,
			decodedToken = null;
		// logged-in
		if (data.token != undefined) {
			authToken = data.token;
			decodedToken = lthis.decodeToken(data.token);
			lthis.user.email = decodedToken.sub;
			var now = new Date();
			lthis.tokenExpirationTime = new Date(
				now.getTime() + (data.duration * 0.8) * 1000);
		}
		// always add Authorization header; not recommanded by jQuery doc (?!)
		var customHeaders = {},
			headerName = lthis.config['adapters']['AuthAdapterTB']['headerName'];
		customHeaders[headerName] = authToken;
		// tell jQuery to always send authorization header
		$jq.ajaxSetup({
		   headers : customHeaders
		});
		// go on
		cb();
	}).fail(function() {
		// only read rights by default
		lthis.user.rights = {
			"read": true, // @TODO check if list is public
			"post": false,
			"moderator": false,
			"admin": false
		};
		cb(); // no one is identified; load app anyway
	});
};

/**
 * Decodes an SSO token @WARNING considers it is valid - true if the token comes
 * directly from the "annuaire" (here, it does) but cannot be guaranteed otherwise
 */
AuthAdapter.prototype.decodeToken = function(token) {
	parts = token.split('.');
	payload = parts[1];
	payload = atob(payload);
	payload = JSON.parse(payload, true);
	return payload;
};
