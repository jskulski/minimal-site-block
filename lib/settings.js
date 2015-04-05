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
		url: data.url("settings.html"),
		onLoad: function onLoad(tab) {
			const worker = tab.attach({
				contentScriptFile: data.url("settings.js")
			});

			const onPrefChange = function onPrefChange(key) {
				worker.port.emit("getRules", getRules());
			}

			worker.port.on("add", addRule);
			worker.port.on("remove", removeRule);

			simpleprefs.on("blockedSites", onPrefChange);

			tab.on("close", function onClose(tab) {
				simpleprefs.removeListener("blockedSites", onPrefChange);
			});

			worker.port.emit("getRules", getRules());
		}
	});
}

exports.onClick = onClick;
exports.getRules = getRules;
exports.setRules = setRules;