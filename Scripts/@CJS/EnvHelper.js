const processEnv = globalThis?.process?.env ?? {};
const env = processEnv.ENV ?? processEnv.NODE_ENV;
if (env == "development") env = "dev";
else if (env == "production") env = "prod";

exports.ENV = env;
exports.DEV = env == "dev";
exports.PROD = env == "prod";
exports.TEST = env == "test";

// todo: make-so this helper is used everwhere (eg. by Scripts/Config.ts)