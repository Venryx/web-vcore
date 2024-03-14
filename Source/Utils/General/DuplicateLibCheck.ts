// only set prototype methods if they don't already exist (ie. if this is the first copy of the mobx-graphlink lib being loaded)
if (globalThis.webVCoreInitCount > 0) {
	// if overrides already exist, it means this library must have been loaded more than once; warn
	console.error([
		"It appears that more than one copy of the web-vcore package has been loaded, which is almost certainly not desired.",
		"This is most likely caused by a usage of zalc-publish that ended up botching the yarn.lock file. (zalc is used to replace the npm-published web-vcore, with a local build of the package)",
		`To fix this, it may be as simple as running "yarn add web-vcore" to fix the duplication in yarn.lock. (the zalc entry should still get applied, since it's then present in the .yalc folder)`,
	].join(" "));
} else {
	globalThis.webVCoreInitCount = globalThis.webVCoreInitCount ?? 0;
	globalThis.webVCoreInitCount++;
}