const sp = require("sdk/simple-prefs");
const settings = require("./settings.js");
const pagemod = require("./pagemod.js");

function isExactMatch(pattern) {
	const urlPattern =
		new RegExp("^(http|ftp|https)://[\\w-]+(\\.[\\w-]+)*/$");
	return urlPattern.test(pattern);
}


function isDomainNamePrefixedWithAsterixAndDot(pattern) {
	const urlPattern = new RegExp("^\\*(\\.[\\w-]+)+$");
	return urlPattern.test(pattern);
}


function isURLFollowedByAsterix(pattern) {
	const urlPattern =
		new RegExp("^(http|ftp|https)://[\\w-]+(\\.[\\w-]+)*/\\*$");
	return urlPattern.test(pattern);
}

function initialize() {
	// Validate rules
	const blockedSites = settings.getRules();

	const newBlockedSites = [];

	for each (let rule in blockedSites) {
		rule = rule.trim();

		if (isExactMatch(rule) ||
			isDomainNamePrefixedWithAsterixAndDot(rule) ||
			isURLFollowedByAsterix(rule)) {

			newBlockedSites.push(rule);
		}
	}

	settings.setRules(newBlockedSites);

	// Initialize onClick for settings change
	sp.on("blockSitesUI", settings.onClick);

	// Set up pagemod
	pagemod.setup();
}

exports.initialize = initialize;