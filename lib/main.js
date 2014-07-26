// Define required libraries
var pageMods = require("sdk/page-mod");
var data = require("sdk/self").data;
var simpleprefs = require("sdk/simple-prefs");

// Define global constants
const SITESSEPARATOR = ',';

// Define global variables
var blockJS = data.url("block.js");
var blockedSites = simpleprefs.prefs.blockedSites.split(SITESSEPARATOR);
var changePageMod = null;

// Function to create the blocking page mod
function createPageMod() {
	changePageMod = pageMods.PageMod({
			include: blockedSites,
			contentScriptFile: blockJS,
			contentScriptWhen: 'start'
	});
}

// Function for handling prefence changes of blocked Sites
function onPrefChange (prefName) {
	switch(prefName) {
		case "blockedSites":
			// Collect the old pageMod
			changePageMod.destroy();
			changePageMod = null;
			// Check for correct values
			var tempBlockedSites = simpleprefs.prefs.blockedSites.split(SITESSEPARATOR);
			blockedSites.splice(0,blockedSites.length);
			for each (var blockedSite in tempBlockedSites) {
				if (blockedSite.split('*').length <= 2) {
					blockedSites.push(blockedSite);
				}
			}
			simpleprefs.prefs.blockedSites = blockedSites.join(SITESSEPARATOR);
			// Create a new one
			createPageMod();
			break;
	}
}

// Listen to changes to the preferences of blocked Sites
simpleprefs.on('blockedSites', onPrefChange);


// Create the page mod to trigger the blocking
createPageMod();