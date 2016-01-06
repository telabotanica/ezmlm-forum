/**
 * binette.js - very simple emoji library
 * 
 * "static-class-like" utility to replace emoticon-looking character sequences
 * like ":'(" or ":cry:"
 * 
 * @author Tela Botanica <http://www.tela-botanica.org> - 2016-01-06
 * @licence : GPLv3
 */

// pseudo "static class"
function Binette() {
}

/**
 * binettes are character sequences looking like an emoticon (smiley)
 * > add your own here !
 */
Binette.binettes = {
	":'(": "U+1F622"
};

/**
 * Unicode emoji characters by code 
 * This is NOT an exhaustive list - il only aims at covering the "smileys"
 */
Binette.emoji = {
	"U+1F622": {
		hex: "\uD83D\uDE22",
		char: "😢"
	}
};

Binette.escapeSpecialChars = function(regex) {
	return regex.replace(/([()[{*+.$^\\|?])/g, '\\$1');
};

/**
 * Given a text, replaces every occurrence of any emoticon-looking characters
 * sequence (ie. ":'(" ) with the corresponding unicode character (emoji); 
 * returns the modified text
 */
Binette.binettize = function(text) {
	for (var i in Binette.binettes) {
		var regex = new RegExp(Binette.escapeSpecialChars(i), 'gim');
		text = text.replace(regex, Binette.emoji[Binette.binettes[i]].char);
	}
	return text;
};
