import fs from "fs";
//import {execSync} from "child_process";
import {createRequire} from "module";
const require = createRequire(import.meta.url);
const patchPackagePath =
	fs.existsSync("./node_modules/patch-package") ? `${process.cwd()}/node_modules/patch-package` :
	fs.existsSync("../../node_modules/patch-package") ? `${process.cwd()}/../../node_modules/patch-package` :
	(()=>{ throw new Error(`Could not find patch-package, relative to:${process.cwd()}`); })();
const require_patch = subpath=>require(`${patchPackagePath}/dist/${subpath}`);

//console.log("Test1;", process.cwd());
for (const patchFile of fs.readdirSync("./patches")) {
	let orgName, packageName;
	if (patchFile.startsWith("@")) {
		[, orgName, packageName] = patchFile.match(/@(.+?)\+(.+?)\+/)!;
	} else {
		packageName = patchFile.match(/(.+?)\+/)?.[1];
	}
	//console.log("Path:", patchFile, "@Org:", orgName, "@Pkg:", packageName);

	const orgPlusPackageSubpath = orgName ? `@${orgName}/${packageName}` : packageName;
	const isSubdepUnderWVC = fs.existsSync(`./node_modules/${orgPlusPackageSubpath}`);
	const isSubdepAsPeer = fs.existsSync(`../${orgPlusPackageSubpath}`);
	
	//let result;
	if (isSubdepUnderWVC) {
		console.log(`Applying patch for ${patchFile}, at subdep path.`);
		ApplyPatch(patchFile, true);
		//result = execSync(`git apply --ignore-space-change --ignore-whitespace patches/${patchFile}`);
	} else if (isSubdepAsPeer) {
		console.log(`Applying patch for ${patchFile}, at peer path.`);
		ApplyPatch(patchFile, false);
		//result = execSync(`cd ../.. && git apply --ignore-space-change --ignore-whitespace node_modules/web-vcore/patches/${patchFile}`);
	} else {
		throw new Error(`Cannot find package as either subdep or peer:${orgPlusPackageSubpath}`);
	}
	//console.log("Patch-apply result:", result);
}

function ApplyPatch(patchFile: string, asSubdep: boolean) {
	//console.log("Test2:", orgPlusPackageSubpath);
	require_patch("patchFs.js").getPatchFiles = ()=>[patchFile]; // monkey-patch

	//const appPath = require_patch("./getAppRootPath").getAppRootPath();
	//const appPath = orgPlusPackageSubpath.startsWith("..") ? "../.." : ".";
	const appPath = asSubdep ? process.cwd() : `${process.cwd()}/../..`;
	//const reverse = !!argv["reverse"];
	const reverse = false;
	//const shouldExitWithError = !!argv["error-on-fail"] || is_ci_1.default || process_1.default.env.NODE_ENV === "test";
	const shouldExitWithError = false;
	require_patch("applyPatches.js").applyPatchesForApp({appPath, reverse, patchDir: "./patches", shouldExitWithError});
}