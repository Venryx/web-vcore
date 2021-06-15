# web-vcore

Core code shared between my projects, for web-app frontends.

### Installation

1) Install the package: (or symlink it; that's recommended for long-term usagge)
```
npm install web-vcore

# install packages for Scripts folder
npm install -D node-sass @babel/plugin-proposal-nullish-coalescing-operator @babel/plugin-proposal-optional-chaining @babel/plugin-proposal-class-properties
```
2) Add the following to your code entry-file (or anywhere really):
```
import "web-vcore/nm/@All"; // helps vscode's auto-importer notice the "web-vcore/nm/*" package re-exports
```
<!-- 2) Add the following to your `tsconfig.json`:
```
[tsconfig.json/compilerOptions:]
"paths": {
	"web-vcore/node_modules/*": [
		"../../../node_modules/web-vcore/node_modules/*", // if web-vcore is symlinked
		"../../../node_modules/*" // if web-vcore is not symlinked
	]
},
``` -->

Note: Make sure you use version 5.0.0 of immer exactly. There is some bug with the newer versions (eg. 5.3.2), when used with my npm-patches anyway, which causes perf issues in certain situations that are very hard to track down. (only when dev-tools are open, and only with certain Link.actionFunc code-blocks) [update: I don't think this requirement is true anymore, but not sure]