# web-vcore

Core code shared between my projects, for web-app frontends.

### Installation

1) Install the package: (or symlink it; that's recommended for long-term usage)
```
npm install web-vcore
```
2) [opt] Add the following to your code entry-file (or anywhere really):
```
import type {} from "web-vcore/nm/@All"; // helps vscode's auto-importer notice the "web-vcore/nm/*" package re-exports
```
3) Add the following to your `tsconfig.json`: (these entries are only needed for packages that are peer-dependencies of a user-project node-module)
```
"compilerOptions" {
	"paths": {
		"react": [
			"node_modules/web-vcore/node_modules/react",
			"node_modules/react",
		]
		// for monorepo:
		/*"react": [
			"../../../node_modules/web-vcore/node_modules/react",
			"../../../node_modules/react",
		]*/
	},
},
"references": [
	{"path": "node_modules/web-vcore"},
	// for monorepo:
	//{"path": "../../node_modules/web-vcore"},
]
```
4) Make-so web-vcore's package-patches get applied, by adding this to your project's package.json `scripts` field:
```
"postinstall": "patch-package --patch-dir ./node_modules/web-vcore/patches"
```
And this to your `.yarnrc.yml` file:
```
plugins:
  - node_modules/web-vcore/.yarn/plugins/yarn-vtools-plugin/index.js
```
5) Various other things, like populating the RootStore interface. (for now, just reference an existing project that uses web-vcore, as seen below)

### Creating package patches

Regular: `patch-package patch MY_PACKAGE`
With package.json: `patch-package patch MY_PACKAGE --exclude 'nothing'`

If including package.json, modify the diff file afterward to omit the npm-install-related noise.

For details on how the patch files are parsed, see here: https://github.com/ds300/patch-package/blob/5c2c92bf504885fba4840870a23fc8999c00e572/src/patch/parse.ts

### Documentation

For the most part, web-vcore is meant to be learned/used based on referencing the codebase of existing projects using it (eg. [Debate Map](https://github.com/debate-map/app)). This is because the package is only intended/expected to be used for projects I'm building, so there's not that much benefit to creating full-fledged documentation.

That said, there are some things (eg. particularly complex components) for which documentation is worth creating, both for collaborators on projects I've made, as well as for my own reference in the future.

* [Abbreviations and Comments](./tree/master/Docs/AbbreviationsAndComments.md)
* [Database Migrations](./tree/master/Docs/DatabaseMigrations.md)