const simpleprefs = require("sdk/simple-prefs");
const settings = require("./settings.js");
const data = require("sdk/self").data;
const url = require("sdk/url");
const pageMods = require("sdk/page-mod");

var pageMod = null;
var blockFiles = null;
var blockData = null;

function setup() {
	const blockedSites = settings.getRules();

	if (pageMod != null) {
		pageMod.destroy();
		pageMod = null;
	}

	if (blockFiles != null) {
		blockFiles.destroy();
		blockFiles = null;
	}

	if (blockData != null) {
		blockData.destroy();
		blockData = null;
	}

	try {
		if (simpleprefs.prefs.blockFiles) {
			blockFiles = pageMods.PageMod({
				include: ["file://*"],
				contentScriptWhen: 'start',
				onAttach: function(worker) {
					u = url.URL(worker.tab.url);
					worker.tab.url = data.url('blocked.html') + "?"
						+ "host=" + u.host + "&"
						+ "scheme=" + u.scheme;
			}
		});
		}
	}
	catch (e) {
		console.log(e);
	}

	try {
		if (simpleprefs.prefs.blockData) {
			blockData = pageMods.PageMod({
				include: ["data:*"],
				contentScriptWhen: 'start',
				onAttach: function(worker) {
					u = url.URL(worker.tab.url);
					worker.tab.url = data.url('blocked.html') + "?"
						+ "host=" + u.host + "&"
						+ "scheme=" + u.scheme;
			}
		});
		}
	}
	catch (e) {
		console.log(e);
	}

	if (blockedSites.length == 0) {
		return;
	}

	try {
		pageMod = pageMods.PageMod({
			include: blockedSites,
			contentScriptWhen: 'start',
			onAttach: function(worker) {
				u = url.URL(worker.tab.url);
				worker.tab.url = data.url('blocked.html') + "?"
					+ "host=" + u.host + "&"
					+ "scheme=" + u.scheme;
			}
		});
	}
	catch (e) {
		console.log(e);
	}
}

simpleprefs.on("blockedSites", function onChange(key) {
	setup();
});

simpleprefs.on("blockFiles", function onChange(key) {
	setup();
});

simpleprefs.on("blockData", function onChange(key) {
	setup();
});

exports.setup = setup;