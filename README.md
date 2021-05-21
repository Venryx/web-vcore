# web-vcore

Core code shared between my projects, for web-app frontends.

### Installation

```
npm install web-vcore

# install packages for Scripts folder
npm install -D node-sass @babel/plugin-proposal-nullish-coalescing-operator @babel/plugin-proposal-optional-chaining
```

Note: Make sure you use version 5.0.0 of immer exactly. There is some bug with the newer versions (eg. 5.3.2), when used with my npm-patches anyway, which causes perf issues in certain situations that are very hard to track down. (only when dev-tools are open, and only with certain Link.actionFunc code-blocks) [update: I don't think this requirement is true anymore, but not sure]