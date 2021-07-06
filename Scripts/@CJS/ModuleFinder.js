const process = require("process");
const paths = require("path");
const fs = require("fs");

/** Helpful for finding the path to a subdependency of web-vcore, regardless of whether caller: 1) is in monorepo, 2) has web-vcore symlinked */
module.exports.FindWVCNodeModule = function(name, relativeTo = process.cwd()) {
	// (the below could maybe be simplified through use of __dirname)
	const pathsToTry = [
		paths.join(relativeTo, `./node_modules/web-vcore/node_modules/${name}`),
		paths.join(relativeTo, `./node_modules/${name}`),
		paths.join(relativeTo, `../../node_modules/web-vcore/node_modules/${name}`),
		paths.join(relativeTo, `../../node_modules/${name}`),
	];
	const path = pathsToTry.find(a=>fs.existsSync(a));
	if (path == null) throw new Error(`Failed to find web-vcore node-module "${name}".`);
	return path;
};