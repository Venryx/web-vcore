import debug_base from "debug";
import ip from "ip";
import path from "path";
//import yargs from "yargs";

//const {argv} = yargs;

//const __dirname = path.dirname(fileURLToPath(import.meta.url));
const {NODE_ENV, PORT, USE_TSLOADER, BASENAME} = process.env;
const debug = debug_base("app:config");

// make these variables global throughout the compile-time scripts
declare global {
	namespace NodeJS {
		interface Global {
			ENV: string|undefined;
			DEV: boolean;
			PROD: boolean;
			TEST: boolean;
		}
	}
	// commented; causes ts-errors in user-projects atm
	/*const ENV: string;
	const DEV: boolean;
	const PROD: boolean;
	const TEST: boolean;*/
}
declare const ENV, DEV, PROD, TEST;

global.ENV = NODE_ENV;
global.DEV = ENV == "development";
global.PROD = ENV == "production";
global.TEST = ENV == "test";

// alias for stringify; we have to stringify/wrap-with-quotes the global-var names (ie. make them json), because that's what webpack.DefinePlugin expects
function S(obj) {
	return JSON.stringify(obj);
}

const config_base = {
	// paths
	dir_source: "Source",
	dir_sourceJS: "Source_JS",
	dir_dist: "Dist",
	dir_server: "Scripts/Server",
	dir_test: "Tests",
	//resourceFolders: [{sourcePath: "Resources"}] as {sourcePath: string, destSubpath?: string}[], // destSubpath avoided for now, since requires special handling in Server.ts
	resourceFolders: [{sourcePath: "Resources"}] as {sourcePath: string}[],
	resourceFiles: [] as {sourcePath: string, destSubpath?: string}[],

	// server
	server_host: ip.address(), // use string "localhost" to prevent exposure on local network

	// compiler
	// list of types: https://webpack.js.org/configuration/devtool
	// *: All "eval" ones don't work anymore with new tsc setup -- they don't show original files
	// compiler_devtool: "source-map", // shows: original (in error.stack, shows bundle line) [6s/rebuild]
	// compiler_devtool: 'cheap-eval-source-map', // *shows: ...
	// compiler_devtool: 'cheap-module-eval-source-map', // *shows: original (in error.stack, shows eval/transpiled-to-js-but-in-module line)
	// compiler_devtool: 'cheap-module-source-map', // shows: original [however, for some reason it misses lots of lines -- at least in async functions]
	// compiler_devtool: "eval", // *shows: transpiled-to-js
	compiler_devtool: PROD ? "source-map" : "cheap-source-map", // cheap-source-map: transpiled-to-js [.8s/rebuild]
	// compiler_devtool: 'source-map', // for trying to get source-map-loader working
	compiler_fail_on_warning: false,
	compiler_quiet: false,
	compiler_public_path: "/",
	compiler_stats: {
		chunks: PROD,
		chunkModules: PROD,
		colors: true,
	},
	compiler_hash_type: PROD ? "chunkhash" : null,
	// compiler_css_modules: true, // enable/disable css modules

	/* eslint-disable */
	codeVarReplacements: {
		// this is always a compile-time define/insertion
		"ENV_COMPILE_TIME": S(ENV),
		// if building for production, lock all the env-variables as compile-time defines (meaning eg. `if (DEV)` blocks are compiled out)
		...(PROD && {
			"ENV": S(ENV),
			"DEV": S(DEV),
			"PROD": S(PROD),
			"TEST": S(TEST)
		}),

		// DON'T EVER USE THESE (use ones above instead -- to be consistent); we only include them in case libraries use them (such as redux)
		// ==========

		"NODE_ENV": S(ENV),
		// this version is needed, for "process.env.XXX" refs from libs we don't care about (else runtime error)
		"process.env": {
			NODE_ENV: S(ENV),
		},
		//"process.env.NODE_ENV": S(ENV),
		...{
			"__DEV__": S(DEV),
			"__PROD__": S(PROD),
			"__TEST__": S(TEST),
		},
		//"__COVERAGE__": !argv.watch ? S(TEST) : null,
		//"__BASENAME__": S(BASENAME),
	},
	/* eslint-enable */

	// disabled for now; I've found I like the control of being able to skip reloads during change sets
	useHotReloading: false,
};

// What should be defined in this generic Config structure, rather than Serve() arguments, etc?
// Rule of thumb: Put information here if it's used by more than one of those entry-points. (or is likely to become so in the future)
export function CreateConfig(ext: Partial<typeof config_base> & {path_base: string, server_port: string | number}) {
	debug("Creating default configuration.");
	const config = Object.assign(
		config_base,
		ext,
		{
			utils_paths: {
				base: (...extra)=>path.resolve(ext.path_base, ...extra),
				source: (...extra)=>path.resolve(ext.path_base, config.dir_source, ...extra),
				sourceJS: (...extra)=>path.resolve(ext.path_base, config.dir_sourceJS, ...extra),
				dist: (...extra)=>path.resolve(ext.path_base, config.dir_dist, ...extra),
			},
		},
	);
	/*if (ext.extraResourceFolders) { // commented, since realized user-project can just modify resource-folders array itself
		config.resourceFolders.push(...ext.extraResourceFolders);
	}*/
	return config;
}

export type CreateConfig_ReturnType = ReturnType<typeof CreateConfig>;