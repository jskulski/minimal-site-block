// Define required libraries
var pageMods = require("sdk/page-mod");
var data = require("sdk/self").data;
var simpleprefs = require("sdk/simple-prefs");

// Define global constants
var SITESSEPARATOR = ',';

// Define global variables
var blockJS = data.url("block.js");
var blockedJS = data.url("blocked.js");
var blockedHTML = data.load("blocked.html");
var blockedSites = simpleprefs.prefs.blockedSites.split(SITESSEPARATOR);

// Function for handling prefence changes of blocked Sites
function onPrefChange (prefName) {
	switch(prefName) {
		case "blockedSites":
			var tempBlockedSites = simpleprefs.prefs.blockedSites.split(SITESSEPARATOR);
			var newBlockedSites = [];
			for each (var blockedSite in tempBlockedSites) {
				if (blockedSite.split('*').length <= 2) {
					newBlockedSites.push(blockedSite);
				}
			}
			simpleprefs.prefs.blockedSites = newBlockedSites.join(SITESSEPARATOR);
			break;
	}
}

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

// Listen to changes to the preferences of blocked Sites
simpleprefs.on('blockedSites', onPrefChange);