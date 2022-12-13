import express from "express";
import debug_base from "debug";
import webpack from "webpack";
import devMiddleware from "webpack-dev-middleware";
import connectHistoryAPIFallback from "connect-history-api-fallback";
import pathModule from "path";
import type {CreateConfig_ReturnType} from "../Config";
import {DEV} from "../EnvVars/ReadEnvVars.js";
//import fs from "fs";

const debug = debug_base("app:server");

export function Serve(config: CreateConfig_ReturnType, webpackConfig: webpack.Configuration|null, extToServe = ["html", "js", "css", "png", "jpg", "wasm"], writeToDisk = undefined) {
	const paths = config.utils_paths;
	const app = express();

	// This rewrites all routes requests to the root /index.html file (ignoring file requests).
	// If you want to implement universal rendering, you'll want to remove this middleware.
	app.use(connectHistoryAPIFallback({
		rewrites: [
			{
				from: new RegExp(`^(.(?!\\.(${extToServe.join("|")})))+$`), // paths with these extensions will NOT be redirected to "index.html""
				to(context) {
					return "/index.html";
				},
			},
		],
	}));

	// apply webpack HMR middleware
	// ----------

	if (DEV) {
		if (webpackConfig == null) throw new Error("If DEV, webpackConfig must be non-null.");
		const compiler = webpack(webpackConfig);

		//compiler.apply(new webpack.ProgressPlugin({ profile: true }));
		//compiler.apply(new webpack.ProgressPlugin());

		debug("Enable webpack dev and HMR middleware");
		app.use(devMiddleware(compiler, {
			// removed from webpack 5 update apparently
			/*publicPath: webpackConfig.output.publicPath,
			contentBase: paths.source(),
			hot: config.useHotReloading,
			quiet: config.compiler_quiet,
			noInfo: config.compiler_quiet,
			lazy: false,
			progress: true,*/

			stats: config.compiler_stats,
			writeToDisk,
			/* watchOptions: {
				// makes-so a typescript-recompile (with multiple changed files) only triggers one webpack-recompile
				// [not needed anymore, since using tsc-watch]
				//aggregateTimeout: 2000,
				//ignored: "^(?!.*TSCompileDone\.marker)", // ignore all files other than special "TSCompileDone.marker" file
				//ignored: "**#/*",
				ignored: "!./Source_JS/TSCompileDone.marker",
			} */
		}));
		if (config.useHotReloading) {
			//app.use(hotMiddleware(compiler));
		}

		// app.use(express.static(paths.dist())); // enable static loading of files in Dist, for dll.vendor.js
	} else {
		console.log(
			`Server is being run outside of live development mode, meaning it will only serve the compiled application bundle in ~/Dist.${""
			} Generally you do not need an application server for this and can instead use a web server such as nginx to serve your static files.`,
		);

		// Serving ~/Dist by default. Ideally these files should be served by the web server and not the app server, but this helps to demo the server in production.
		app.use(express.static(paths.dist()));
		//console.log("Path:", paths.dist(), "@files:", fs.readdirSync(paths.dist()));
	}

	// serve static assets from resource folders, since webpack is unaware of these files (in dev-mode only, since resources are hard-copied into ~/Dist when app is compiled, in Compile.ts)
	for (const resourceFolder of config.resourceFolders) {
		app.use(express.static(paths.base(resourceFolder.sourcePath)));
	}
	// for resource-file entries, just serve each one's containing folder (this only happens for devs, so should be fine; for prod, Compile.ts only copies the specific files listed)
	//const resourceFileFolders = config.resourceFiles.map(a=>pathModule.dirname(a.sourcePath)).filter((entry, i, arr)=>arr.indexOf(entry) == i);
	/*const resourceFileFolders = [...new Set(config.resourceFiles.map(a=>pathModule.dirname(a.sourcePath)))];
	for (const resourceFileFolder of resourceFileFolders) {
		app.use(express.static(paths.base(resourceFileFolder)));
	}*/
	// for resource-file entries, serve each one to its specific destination path (since "app.use(express.static(...))" is built for folders and doesn't let you specify dest-subpath)
	for (const resourceFile of config.resourceFiles) {
		const fileName = pathModule.basename(resourceFile.sourcePath);
		app.use(`/${resourceFile.destSubpath ?? fileName}`, express.static(paths.base(resourceFile.sourcePath)));
	}

	const port = config.server_port;
	app.listen(port);
	debug(`Server is now running at http://localhost:${port}.`);
}