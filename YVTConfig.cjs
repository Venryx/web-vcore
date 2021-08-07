exports.config = {};

console.log("VLIBS_USER:", process.env.VLIBS_USER);
if (process.env.VLIBS_USER == "venryx") {
	//const fs = require("fs");

	//const vReposRoot = fs.existsSync("C:/Root/Apps/@V") ? `C:/Root/Apps/@V` : null;
	const thisDir = __dirname.replace(/\\/g, "/");
	const vReposRoot = thisDir.startsWith("C:/Root/Apps/@V") ? `C:/Root/Apps/@V` : null;
	const vReposRoot_stepsUpFromThisDir = thisDir.split("/").length - vReposRoot.split("/").length;
	const vReposRoot_stepUpStr = "../".repeat(vReposRoot_stepsUpFromThisDir);

	exports.config.dependencyOverrideGroups = [
		{
			name: "venryx",
			/*conditions: [
				{
					envVarEquals: {
						name: "VLIBS_USER",
						value: "venryx",
					},
				},
			],*/
			overrides_forSelf: process.env.VLIBS_USE_SYMLINKS == "off" ? {} : {
				// use relative paths, since yarn is more reliable with those fsr (last time I tried anyway)
				"graphql-feedback": `link:${vReposRoot_stepUpStr}/@Modules/graphql-feedback/Main`,
				"js-vextensions": `link:${vReposRoot_stepUpStr}/@Modules/js-vextensions/Main`,
				"react-vextensions": `link:${vReposRoot_stepUpStr}/@Modules/react-vextensions/Main`,
				"react-vcomponents": `link:${vReposRoot_stepUpStr}/@Modules/react-vcomponents/Main`,
				"react-vmenu": `link:${vReposRoot_stepUpStr}/@Modules/react-vmenu/Main`,
				"react-vmessagebox": `link:${vReposRoot_stepUpStr}/@Modules/react-vmessagebox/Main`,
				"mobx-graphlink": `link:${vReposRoot_stepUpStr}/@Modules/mobx-graphlink/Main`,
				"eslint-config-vbase": `link:${vReposRoot_stepUpStr}/@Modules/eslint-config-vbase/Main`,
			},
		},
	];
}