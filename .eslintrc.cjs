module.exports = {
	extends: [
		"vbase",
	],
	settings: {
		//"import/extensions": [".js", ".jsx", ".ts", ".tsx"],
		"import/resolver": {
			"webpack": {
				"config": "./webpack.config.js",
			},
			"node": {
				"paths": ["Source"],
				"extensions": [
				  ".js",
				  ".jsx",
				  ".ts",
				  ".tsx",
				]
			 }
		}
	},
	rules: {
	},
	globals: {
	},
};

// the below works for ".json" extension, but that's not ideal (comments surprisingly work, but nothing else)
/*{
	"extends": [
		"vbase"
	],
	"settings": {
		//"import/extensions": [".js", ".jsx", ".ts", ".tsx"],
		"import/resolver": {
			"webpack": {
				"config": "./webpack.config.js"
			},
			"node": {
				"paths": ["Source"],
				"extensions": [
				  ".js",
				  ".jsx",
				  ".ts",
				  ".tsx"
				]
			}
		}
	},
	"rules": {},
	"globals": {}
}*/