const simpleprefs = require("sdk/simple-prefs");
const settings = require("./settings.js");
const data = require("sdk/self").data;
const url = require("sdk/url");
const pageMods = require("sdk/page-mod");

var pageMod = null;
var blockHTTP = null;
var blockFiles = null;
var blockData = null;

function setup() {
	const blockedSites = settings.getRules();

	if (pageMod != null) {
		pageMod.destroy();
		pageMod = null;
	}

	if (blockHTTP != null) {
		blockHTTP.destroy();
		blockHTTP = null;
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
		if (simpleprefs.prefs.blockHTTP) {
			blockHTTP = pageMods.PageMod({
				include: ["http://*"],
				contentScriptWhen: 'start',
				onAttach: function(worker) {
					u = url.URL(worker.tab.url);
					worker.tab.url = data.url('blocked.html') + "?"
						+ "host=" + u.host + "&"
						+ "scheme=" + u.scheme + "&"
						+ "reason=http";
				}
			});
		}
	}
	catch (e) {
		//console.log(e);
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
						+ "scheme=" + u.scheme + "&"
						+ "reason=file";
				}
			});
		}
	}
	catch (e) {
		//console.log(e);
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
						+ "scheme=" + u.scheme + "&"
						+ "reason=data";
				}
			});
		}
	}
	catch (e) {
		//console.log(e);
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
					+ "scheme=" + u.scheme + "&"
					+ "reason=rule";
			}
		});
	}
	catch (e) {
		//console.log(e);
	}
}

simpleprefs.on("blockedSites", function onChange(key) {
	setup();
});

simpleprefs.on("blockHTTP", function onChange(key) {
	setup();
});

simpleprefs.on("blockFiles", function onChange(key) {
	setup();
});

simpleprefs.on("blockData", function onChange(key) {
	setup();
});

// Setup settings pageMod
try {
	pageMods.PageMod({
		include: data.url("settings.html"),
		contentScriptWhen: 'start',
		contentScriptFile: data.url("settings.js"),
		onAttach: function onAttach(worker) {
			let onPrefChange = function onPrefChange(key) {
				worker.port.emit("getRules", settings.getRules());
			}

			worker.port.on("add", settings.addRule);
			worker.port.on("remove", settings.removeRule);

			simpleprefs.on("blockedSites", onPrefChange);

			worker.tab.on("close", function onClose(tab) {
				simpleprefs.removeListener("blockedSites", settings.onPrefChange);
			});

			worker.port.on("event", function onEvent(event) {
				if (event === "load") {
					worker.port.emit("getRules", settings.getRules());
				}
			});

			worker.port.emit("getRules", settings.getRules());
		}
	});
}
catch (e) {
	//console.log(e);
}

exports.setup = setup;