import CSSNano from "cssnano";
import debug_base from "debug";
// import resolverFactory from 'enhanced-resolve/lib/ResolverFactory';
import SymlinkPlugin from "enhanced-resolve/lib/SymlinkPlugin";
import fs from "fs";
import pathModule from "path";
import {fileURLToPath} from 'url';
import HtmlWebpackPlugin from "html-webpack-plugin";
//import {CE} from "js-vextensions";
import {CE, E} from "js-vextensions/Source"; // temp; require source, thus ts-node compiles to commonjs (fix for that ts-node doesn't support es2015-modules)
import MiniCssExtractPlugin from "mini-css-extract-plugin";
//import HardSourceWebpackPlugin from "hard-source-webpack-plugin";
import SpriteLoaderPlugin from "svg-sprite-loader/plugin";
import webpack from "webpack";
import WebpackStringReplacer from "webpack-string-replacer";
// const BundleAnalyzerPlugin = require("webpack-bundle-analyzer").BundleAnalyzerPlugin;
// const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
// const AutoDllPlugin = require("autodll-webpack-plugin");
import wvcPackageJSON from "../../package.json";
import {MakeSoWebpackConfigOutputsStats} from "./WebpackConfig/OutputStats";

declare const ENV, DEV, PROD, TEST;
declare const {CreateConfig}: typeof import("../Config");
const debug = debug_base("app:webpack:config");

const {QUICK, USE_TSLOADER, OUTPUT_STATS} = process.env;

const __dirname = pathModule.dirname(fileURLToPath(import.meta.url));
function PathFromWebVCoreRoot(...subpathNodes: string[]) {
	return pathModule.join(__dirname, "..", "..", ...subpathNodes);
}

//const deps = CE(wvcPackageJSON.dependencies).VKeys();
const peerDeps = CE(wvcPackageJSON.peerDependencies).VKeys();
const ownModules = [
	"js-vextensions", // js (base)
	"react-vextensions", "react-vcomponents", "react-vmenu", "react-vmessagebox", /*"react-vscrollview",*/ "react-vmarkdown", // +react
	"firebase-feedback", "firebase-forum", // +firebase
	"mobx-firelink", // +mobx
	"web-vcore", // +framework
	"webpack-runtime-require", // misc
];
//const webVCore_nodeModules = fs.readdirSync(PathFromWebVCoreRoot("node_modules"), {withFileTypes: true}).map(a=>a.name);
//const reExportedModules = fs.readdirSync(PathFromWebVCoreRoot("nm"), {withFileTypes: true}).filter(a=>a.isFile() && !a.name.startsWith("@All")).map(a=>a.name.split(".").slice(0, -1).join("."));
function GetAliases(opt: CreateWebpackConfig_Options) {
	const paths = opt.config.utils_paths;
	const flatList = [
		...peerDeps,

		// necessary consolidations, to fix issues
		//"mobx-firelink/node_modules/mobx": paths.base("node_modules", "mobx"), // fsr, needed to prevent 2nd mobx, when mobx-firelink is npm-linked [has this always been true?]
		"mobx",

		// convenience consolidations, since they have npm-patches applied (and we don't want to have to adjust the match-counts)
		"react-beautiful-dnd",
		"immer",
		"mobx-utils",

		// convenience consolidations (for any own-modules not in peer-deps), to keep things tidy (fine since we know the different versions will be compatible anyway)
		...ownModules,
	];
	//const map = {};

	const result = {};
	for (const name of flatList) {
		if (fs.existsSync(paths.base("node_modules", name))) {
			result[name] = paths.base("node_modules", name);
		}
		// for if in monorepo, check root/hoist node_modules folder
		if (fs.existsSync(paths.base("..", "..", "node_modules", name))) {
			result[name] = paths.base("..", "..", "node_modules", name);
		}
	}
	/*for (const name of reExportedModules) {
		if (fs.existsSync(PathFromWebVCoreRoot("node_modules", name))) {
			result[`@vcnm/${name}`] = PathFromWebVCoreRoot("node_modules", name);
		} else {
			throw new Error(`Could not find module "${name}" to re-export. FirstCheck: ${paths.base("node_modules", name)}`);
		}
	}*/
	return result;
}


export class TSLoaderEntry {
	//context: string;
	test: webpack.RuleSetCondition;
}
export class CreateWebpackConfig_Options {
	config: ReturnType<typeof CreateConfig>;
	npmPatch_replacerConfig: any;

	/** Raw webpack-config field sets/overrides. */
	ext: Partial<webpack.Configuration> & {
		name: string,
	};

	// custom options
	sourcesFromRoot?= false;
	//tsLoaderPaths?: webpack.RuleSetConditions;
	//tsLoaderPaths?: string[];
	tsLoaderEntries?: TSLoaderEntry[];
}

export function CreateWebpackConfig(opt: CreateWebpackConfig_Options) {
	opt = E(new CreateWebpackConfig_Options(), opt);

	const paths = opt.config.utils_paths;
	const wvcFolderInfo = fs.lstatSync(paths.base("node_modules/web-vcore"));
	const wvcSymlinked = wvcFolderInfo.isSymbolicLink();
	if (wvcSymlinked) console.log("WVC folder detected to be symlinked. Will adjust webpack config to be compatible.");
	function SubdepPath(subPath: string) {
		// if vwaf is symlinked, we have to tunnel into vwaf folder to find its subdeps
		if (wvcSymlinked) {
			return `web-vcore/node_modules/${subPath}`;
		}
		// if vwaf is installed normally (from npm install), then its subdeps will be peers/directly-under-user-project, so don't prepend anything
		return subPath;
	}

	debug("Creating configuration.");
	const webpackConfig = <webpack.Configuration>{
		//name: "client",
		mode: PROD && !QUICK ? "production" : "development",
		optimization: {
			// use paths as runtime identifiers for webpack modules (easier debugging)
			// namedModules: true, // commented; not needed, since "output.pathinfo=true" (and, before at least, would cause problems when inconsistent between bundles)
			//namedModules: true,
			moduleIds: "named",
			noEmitOnErrors: true,
		},
		target: "web",
		devtool: opt.config.compiler_devtool as any,
		resolve: {
			modules:
				opt.sourcesFromRoot
					? [
						"node_modules", // commented; thus we ignore the closest-to-import-statement node_modules folder, instead we: [...]
						// paths.base('node_modules'), // [...] always get libraries from the root node_modules folder
						// paths.source(),
						//USE_TSLOADER ? paths.source() : paths.sourceJS(),
						!USE_TSLOADER && paths.sourceJS(), // add source-js folder first, so it has priority
						paths.base(),
					].filter(a=>a)
					: [
						"node_modules", // commented; thus we ignore the closest-to-import-statement node_modules folder, instead we: [...]
						// paths.base('node_modules'), // [...] always get libraries from the root node_modules folder
						// paths.source(),
						USE_TSLOADER ? paths.source() : paths.base("Source_JS"),
					],
			// extensions: [".js", ".jsx", ".json"].concat(USE_TSLOADER ? [".ts", ".tsx"] : []),
			extensions: [
				".js", ".jsx", ".json",
				".ts", ".tsx", // always accept ts[x], because there might be some in node_modules (eg. web-vcore)
				".mjs", // needed for mobx-sync
			],
			alias: GetAliases(opt),
		},
		module: {
			rules: [
				// load source-maps (doesn't seem to actually work atm, at least for, eg. js-vextensions lib)
				/* {
					test: /(\.jsx?|\.jsx?\.map)$/,
					use: 'source-map-loader',
					include: [
						// list here the node-modules you want to load the source-maps for
						paths.base('node_modules', 'js-vextensions'),
					],
					enforce: 'pre',
				}, */
				// load fonts/images
				{test: /\.woff(\?.*)?$/, use: "url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/font-woff"},
				{test: /\.woff2(\?.*)?$/, use: "url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/font-woff2"},
				{test: /\.otf(\?.*)?$/, use: "file-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=font/opentype"},
				{test: /\.ttf(\?.*)?$/, use: "url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=application/octet-stream"},
				{test: /\.eot(\?.*)?$/, use: "file-loader?prefix=fonts/&name=[path][name].[ext]"},
				// {test: /\.svg(\?.*)?$/, use: "url-loader?prefix=fonts/&name=[path][name].[ext]&limit=10000&mimetype=image/svg+xml"},
				{test: /\.(png|jpg)$/, use: "url-loader?limit=8192"},
			],
		},
		externals: {
			// temp; fix for firebase-mock in browser (code-path not actually used, so it's okay)
			fs: "root location", // redirect to some global-variable, eg. window.location
		},
	};

	// entry points
	// ==========

	const APP_ENTRY = opt.sourcesFromRoot
		? (USE_TSLOADER ? paths.source("Main.ts") : paths.sourceJS("Source/Main.js"))
		: (USE_TSLOADER ? paths.source("Main.ts") : paths.sourceJS("Main.js"));

	webpackConfig.entry = {
		app: DEV && opt.config.useHotReloading
			? [APP_ENTRY].concat(`webpack-hot-middleware/client?path=${opt.config.compiler_public_path}__webpack_hmr`)
			: [APP_ENTRY],
	};

	// bundle output
	// ==========

	webpackConfig.output = {
		filename: "[name].js?[hash]", // have js/css files have static names, so google can still display content (even when js file has changed)
		path: paths.dist(),
		publicPath: opt.config.compiler_public_path,
		pathinfo: true, // include comments next to require-funcs saying path
	};

	// fix for symlinks
	// ==========

	// don't resolve sym-links to their absolute path (behavior should be the same whether a module is sym-linked or not)
	webpackConfig.resolve.symlinks = false;
	// not sure if this is needed (given flag-set above), but keeping, since it apparently does still get called once
	SymlinkPlugin.prototype.apply = function() {
		console.log("Symlink-plugin disabled...");
	};

	// plugins
	// ==========

	webpackConfig.plugins = [
		// Plugin to show any webpack warnings and prevent tests from running
		function() {
			const errors = [];
			this.hooks.done.tap("ShowWarningsAndStopTests", stats=>{
				if (!stats.compilation.errors.length) return;

				// Log each of the warnings
				stats.compilation.errors.forEach(error=>{
					errors.push(error.message || error);
				});

				// Pretend no assets were generated. This prevents the tests from running, making it clear that there were warnings.
				// throw new Error(errors)
			});
		},
		new webpack.DefinePlugin(opt.config.globals),
		new HtmlWebpackPlugin({
			template: "./Source/index.html",
			hash: false,
			filename: "index.html",
			inject: "body",
			minify: false,
		}),

		// speeds up (non-incremental) builds by quite a lot // disabled atm, since causes webpack crash after every 30 or so rebuilds!
		/* new HardSourceWebpackPlugin({
			configHash: function(webpackConfig) {
				const setIn = require("lodash/fp/set");
				let indexOfStringReplaceRule = webpackConfig.module.rules.findIndex(a=>a.loader && a.loader.includes && a.loader.includes("string-replace-webpack-plugin\\loader.js?id="));
				let config_excludeVolatiles = webpackConfig;
				//config_excludeVolatiles = WithDeepSet(config_excludeVolatiles, ["module", "rules", indexOfStringReplaceRule, "loader"], null);
				config_excludeVolatiles = setIn(`module.rules.${indexOfStringReplaceRule}.loader`, null, config_excludeVolatiles);
				return require("node-object-hash")({sort: false}).hash(config_excludeVolatiles);
			},
			// if all caches combined are over the size-threshold (in bytes), then any caches older than max-age (in ms) are deleted
			/*cachePrune: {
				maxAge: 2 * 24 * 60 * 60 * 1000,
				sizeThreshold: 50 * 1024 * 1024
			},*#/
		}), */
	];

	/* if (DEV) {
		debug('Enable plugins for live development (HMR, NoErrors).');
		webpackConfig.plugins.push(
			new webpack.HotModuleReplacementPlugin(),
			new webpack.NoEmitOnErrorsPlugin(),
			// new webpack.NamedModulesPlugin()
		);
	} else  if (PROD && !QUICK) {
		debug('Enable plugins for production (OccurenceOrder, Dedupe & UglifyJS).');
		webpackConfig.plugins.push(
			// new webpack.optimize.OccurrenceOrderPlugin(),
			// new webpack.optimize.DedupePlugin(),
			new webpack.optimize.UglifyJsPlugin({
				compress: {
					unused: true,
					dead_code: true,
					warnings: false,
					keep_fnames: true,
				},
				mangle: {
					keep_fnames: true,
				},
				sourceMap: true,
			}),
		);
	} */

	// rules
	// ==========

	// javascript transpilation (can also run on typescript->javascript results)
	webpackConfig.module.rules = [
		{
			test: /\.(jsx?|tsx?)$/,
			// we have babel ignore most node_modules (ie. include them raw), but we tell it to transpile the web-vcore typescript files
			// include: [paths.source(), paths.base("node_modules", "web-vcore")],
			include: [
				paths.source(),
				// fs.realpathSync(paths.base('node_modules', 'web-vcore')),
				fs.realpathSync(paths.base("node_modules", "web-vcore", "Source")),
			],
			loader: SubdepPath("babel-loader"),
			options: {
				presets: [
					[
						"@babel/env",
						{
							// use loose transpilation when possible (makes debugging easier)
							loose: true,
							// don't transpile async/await in dev-mode (makes debugging easier)
							exclude: DEV ? ["babel-plugin-transform-async-to-generator", "babel-plugin-transform-regenerator"] : [],
							// targets: {esmodules: true}, // target es2015
							targets: {node: "6.5"}, // target es2015
						},
					],
					"@babel/react",
				],
				plugins: [
					"@babel/plugin-proposal-nullish-coalescing-operator",
					"@babel/plugin-proposal-optional-chaining",
					// for some reason this is needed now (eg. first noticed for GD repo)
					[
						"@babel/plugin-proposal-class-properties",
						{
							loose: true,
						},
					],
				],
			},
		},
	];

	// for using ts-loader to compile the main Source folder files
	/* if (USE_TSLOADER) {
		//webpackConfig.module.rules.push({test: /\.tsx?$/, use: "awesome-typescript-loader"});
		webpackConfig.module.rules.push({test: /\.tsx?$/, loader: "ts-loader", options: {include: [paths.source()]}});
	}*/

	// for using ts-loader to compile ts files in various locations outside of Source (eg. in node_modules)
	/*function resolvePath(...segmentsFromRoot: string[]) {
		//return fs.realpathSync(paths.base(...segmentsFromRoot));
		return paths.base(...segmentsFromRoot);
	}
	const tsLoaderEntries_base = [
		{context: resolvePath("node_modules", "web-vcore"), test: /web-vcore[/\\]Source[/\\].*\.tsx?$/},
		{context: resolvePath("node_modules", "js-vextensions"), test: /js-vextensions[/\\]Helpers[/\\]@ApplyCETypes\.tsx?$/},
	];*/
	const tsLoaderEntries_base = [
		{test: /web-vcore[/\\]Source[/\\].*\.tsx?$/},
		{test: /js-vextensions[/\\]Helpers[/\\]@ApplyCETypes\.d\.ts$/},
	];
	const tsLoaderEntries = opt.tsLoaderEntries ?? tsLoaderEntries_base;

	// to reliably run ts-loader on node_modules folders, each must use a separate ts-loader instance
	// (else it [sometimes] "finds" the tsconfig.json in one, and complains when the other packages' files aren't under its rootDir)
	for (const [index, entry] of tsLoaderEntries.entries()) {
		webpackConfig.module.rules.push({
			// ensures that ts-loader ignores files outside of the path (not needed atm)
			//include: entry.context,
			test: entry.test,
			loader: SubdepPath("ts-loader"),
			options: {
				allowTsInNodeModules: true,
				// forces separate ts-loader instance
				instance: `tsLoader_instance${index}`,
				// ensures that ts-loader finds the correct context and config-file for the path (not needed atm)
				/*context: entry.context,
				configFile: path.resolve(entry.context, "tsconfig.json"),*/
			},
		});
	}

	// for mobx-sync
	webpackConfig.module.rules.push({test: /\.mjs$/, type: "javascript/auto"});

	// file text-replacements
	// ==========

	webpackConfig.plugins.push(new WebpackStringReplacer(opt.npmPatch_replacerConfig));

	// css loaders
	// ==========

	webpackConfig.plugins.push(new MiniCssExtractPlugin());
	webpackConfig.module.rules.push({
		test: /\.css$/,
		use: [
			MiniCssExtractPlugin.loader,
			{
				loader: SubdepPath("css-loader"),
				options: {
					url: false,
					//minimize: false, // cssnano already minifies
				},
			},
		],
	});
	webpackConfig.module.rules.push({
		test: /\.scss$/,
		use: [
			MiniCssExtractPlugin.loader,
			{
				loader: SubdepPath("css-loader"),
				options: {
					url: false,
					//minimize: false, // cssnano already minifies
				},
			},
			{
				loader: SubdepPath("postcss-loader"),
				options: {
					postcssOptions: {
						plugins: loader=>[
							PROD && CSSNano({
								// it seems this weird wrapper thing is needed, from examining source, but will just comment for now
								/* preset: ()=> ({
									plugins: new Promise(resolve=> {
										resolve({ */
								autoprefixer: {
									add: true,
									remove: true,
									browsers: ["last 2 versions"],
								},
								discardComments: {removeAll: true},
								discardUnused: false,
								mergeIdents: false,
								reduceIdents: false,
								safe: true,
								// sourcemap: true
								/*		});
									}),
								}), */
							}),
						].filter(a=>a),
					},
				},
			},
			{
				loader: SubdepPath("sass-loader"),
				options: {
					sassOptions: {
						includePaths: [paths.source()],
					},
					additionalData: (content: string, loaderContext)=>{
						// More information about available properties https://webpack.js.org/api/loaders/
						const {resourcePath, rootContext} = loaderContext;
						//const relativePath = path.relative(rootContext, resourcePath);
						console.log(`Sass-loader preprocessing. @resourcePath:${resourcePath}`);
						//console.log(`Content:${content}`);

						//if (resourcePath.includes("node_modules/web-vcore") && resourcePath.endsWith("Main.scss") && vwafSymlinked) {
						/*const startPoint = content.indexOf("// [StartOfVWAFMainSCSS]");
						const endPoint = content.includes("// [EndOfVWAFMainSCSS]") ? content.indexOf("// [EndOfVWAFMainSCSS]") + "// [EndOfVWAFMainSCSS]".length : -1;
						// if vwaf Main.scss file is part of this content instance, and vwaf is symlinked, replace its top-level subdep imports with ones under vwaf folder
						if (startPoint != -1 && endPoint != -1 && vwafSymlinked) {
							console.log("Found vwaf Main.scss file. Applying fixes, since vwaf is symlinked.");
							const vwafPart = content.slice(startPoint, endPoint);
							const vwafPart_fixed = vwafPart.replace(/@import "~/g, "@import \"~web-vcore/node_modules/");
							return content.slice(0, startPoint) + vwafPart_fixed + content.slice(endPoint);
						}*/

						if (content.includes("web-vcore/Source/Utils/Styles/Entry_Base.scss") && wvcSymlinked) {
							return content.replace(/Styles\/Entry_Base.scss/g, "Styles/Entry_Symlinked.scss");
						}

						return content;
					},
				},
			},
		],
	});

	// finalize configuration
	// ==========

	webpackConfig.plugins.push(
		new SpriteLoaderPlugin(),
	);
	webpackConfig.module.rules.push({
		test: /\.svg$/,
		loader: SubdepPath("svg-sprite-loader"),
		options: {}, // "options" must be present
	});

	if (OUTPUT_STATS) {
		MakeSoWebpackConfigOutputsStats(webpackConfig);
	}

	return Object.assign(webpackConfig, opt.ext);
}

// also do this, for if sending to cli-started webpack
// export default webpackConfig;
// module.exports = webpackConfig;