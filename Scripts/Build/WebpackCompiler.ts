import webpack from "webpack";
import debug_base from "debug";
import type {CreateConfig_ReturnType} from "../Config";

const debug = debug_base("app:build:webpack-compiler");

export function StartWebpackCompiler(config: CreateConfig_ReturnType, webpackConfig: webpack.Configuration, statsFormat?): Promise<webpack.StatsCompilation> {
	statsFormat = statsFormat || config.compiler_stats;

	return new Promise((resolve, reject)=>{
		const compiler = webpack(webpackConfig);

		compiler.run((err, stats)=>{
			if (err) {
				debug("Webpack compiler encountered a fatal error.", err);
				return reject(err);
			}

			const jsonStats = stats!.toJson();
			debug("Webpack compile completed.");
			debug(stats!.toString(statsFormat));

			if (jsonStats.errors!.length > 0) {
				debug("Webpack compiler encountered errors.");
				debug(jsonStats.errors!.join("\n"));
				return reject(new Error(`Webpack compiler encountered errors:\n${jsonStats.errors!.join("\n")}`));
			} if (jsonStats.warnings!.length > 0) {
				debug("Webpack compiler encountered warnings.");
				debug(jsonStats.warnings!.join("\n"));
			} else {
				debug("No errors or warnings encountered.");
			}
			resolve(jsonStats);
		});
	});
}