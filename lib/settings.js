const tabs = require("sdk/tabs");
const data = require("sdk/self").data;
const simpleprefs = require("sdk/simple-prefs");

const SITESSEPARATOR = ',';

const addRule = function addRule(rule) {
	const blockedSites = getRules();

	if (blockedSites.indexOf(rule) < 0) {
		blockedSites.push(rule);	
	}

	setRules(blockedSites);
};

const removeRule = function removeRule(rule) {
	const blockedSites = getRules();
	const index = blockedSites.indexOf(rule);

	if (index >= 0) {
		blockedSite = blockedSites.splice(index, 1);
	}

	setRules(blockedSites);
}

const setRules = function setRules(blockedSites) {
	simpleprefs.prefs.blockedSites = blockedSites.join(SITESSEPARATOR);
}

const getRules = function getRules() {
	const s = simpleprefs.prefs.blockedSites;
	if (s.trim().length == 0) {
		return [];
	}

	return s.split(SITESSEPARATOR);
}

function onClick() {
	tabs.open({
		url: data.url("settings.html")
	});
}

exports.onClick = onClick;
exports.getRules = getRules;
exports.setRules = setRules;
exports.addRule = addRule;
exports.removeRule = removeRule;