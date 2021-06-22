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
3) Add the following to your `tsconfig.json`: (these entries are only needed for packages that are peer-dependencies of a user-project node-module)
```
[tsconfig.json/compilerOptions:]
"paths": {
	"react": [
		"../../../node_modules/web-vcore/node_modules/react",
		"../../../node_modules/react",
	]
},
```
4) Various other things, like populating the RootStore interface. (for now, just reference existing user-projects)

Note: Make sure you use version 5.0.0 of immer exactly. There is some bug with the newer versions (eg. 5.3.2), when used with my npm-patches anyway, which causes perf issues in certain situations that are very hard to track down. (only when dev-tools are open, and only with certain Link.actionFunc code-blocks) [update: I don't think this requirement is true anymore, but not sure]

### Documentation

For the most part, web-vcore is meant to be learned/used based on referencing the codebase of existing projects using it. This is because the package is only intended/expected to be used for projects I'm building, so there's not that much benefit to creating full-fledged documentation.

That said, there are some more "complex components" for which documentation is worth creating, both for collaborators on projects I've made, as well as for my own reference in the future.

* [Database Migrations](./tree/master/Docs/DatabaseMigrations.md)