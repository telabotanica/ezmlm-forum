/**
 * List view management
 */
function ViewList() {
}
ViewList.prototype = new EzmlmForum();

ViewList.prototype.init = function() {
	console.log('ViewList.init()');
	this.showThreads();
};
