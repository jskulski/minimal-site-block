// Define required libraries
var pageMods = require("sdk/page-mod");
var data = require("sdk/self").data;
var simpleprefs = require("sdk/simple-prefs");

// Define global variables
var blockJS = data.url("block.js");
var blockedJS = data.url("blocked.js");
var blockedHTML = data.load("blocked.html");
var blockedSites = simpleprefs.prefs.blockedSites.split(',');

// Create a page mod to rewrite the blocked page
pageMods.PageMod({
	include: "about:blank?error_code=minimal-site-block*",
	contentScriptFile: blockedJS,
	contentScriptWhen: 'ready',
	onAttach: function(worker) {
		worker.port.emit("changeContentTo", blockedHTML);
	}
});

// Create a PageMod to handle to blocking
pageMods.PageMod({
  include: blockedSites,
  contentScriptFile: blockJS,
  contentScriptWhen: 'start'
});