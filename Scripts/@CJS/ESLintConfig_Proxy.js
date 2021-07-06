// 1) ESLint (or its vscode extension) is unable to load the ".eslintrc.js" file in repo root, because NodeJS thinks it's an ESM file (which ESLint doesn't support).
// 2) I thus rename file to ".cjs", but then ESLint fails to notice/use the ".eslintrc.cjs" file in the repo root. (despite GitHub issues saying its resolved).
// 3) I then specify the config-file manually, in ".vscode/settings.json"; but then ESLint thinks it's a YAML file! (gives error "end of the stream or a document separator is expected at line" -- a YAML parser error)
// 4) Thus, we use settings.json to point to this proxy file; this works, because it ends in ".js", but is in a folder where package.json has "type: commonjs".
module.exports = require("../../.eslintrc.cjs");