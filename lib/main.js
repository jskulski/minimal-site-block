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

// Patterns modified from here:
// http://stackoverflow.com/questions/8188645/javascript-regex-to-match-a-url-in-a-field-of-text

function isExactMatch(pattern) {
    var urlPattern = new RegExp("^(http|ftp|https)://[\\w-]+(\\.[\\w-]+)*/$");
    return urlPattern.test(pattern);
}

function isDomainNamePrefixedWithAsterixAndDot(pattern) {
    var urlPattern = new RegExp("^\\*(\\.[\\w-]+)+$");
    return urlPattern.test(pattern);
}

function isURLFollowedByAsterix(pattern) {
    var urlPattern = new RegExp("^(http|ftp|https)://[\\w-]+(\\.[\\w-]+)*/\\*$");
    return urlPattern.test(pattern);
}

function isSchemeFollowedByAsterix(pattern) {
    // Exclude data:// since we are using it for our own plugin!
    var urlPattern = new RegExp("^(file|resource)://\\*$");
    return urlPattern.test(pattern);
}

// Function to create the blocking page mod
function createPageMod() {
	// Check if any pages are currently blocked
	if (blockedSites.length == 0 || (
		blockedSites.length == 1 && blockedSites[0].length == 0)) {
		return;
	}
	var includedSites = [];
	for each (var blockedSite in blockedSites) {
        var pattern = blockedSite.trim();
		if (pattern.length > 0) {
            if (isExactMatch(pattern) ||
                isDomainNamePrefixedWithAsterixAndDot(pattern) ||
                isURLFollowedByAsterix(pattern) ||
                isSchemeFollowedByAsterix(pattern)) {

                includedSites.push(pattern);
            }
		}
	}
	if (includedSites.length == 0) {
		return;
	}
    try {
        changePageMod = pageMods.PageMod({
            include: includedSites,
            contentScriptFile: blockJS,
            contentScriptWhen: 'start'
        });
    }
    catch (e) {
        //console.log(e);
    }
}

// Function for handling prefence changes of blocked Sites
function onPrefChange (prefName) {
	switch(prefName) {
		case "blockedSites":
			// Collect the old pageMod
			if (changePageMod != null) {
				changePageMod.destroy();
				changePageMod = null;
			}
			// Check for correct values
			var tempBlockedSites = simpleprefs.prefs.blockedSites.split(SITESSEPARATOR);
			blockedSites.splice(0,blockedSites.length);
			for each (var blockedSite in tempBlockedSites) {
				// Check for not permitted double wildcards
				if (blockedSite.split('*').length <= 2) {
					// Check if rule is not already existent
					if (blockedSites.indexOf(blockedSite) == -1) {
						blockedSites.push(blockedSite);
					}
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