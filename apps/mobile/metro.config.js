const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Add support for ES modules and common JS extensions
config.resolver.sourceExts = [...config.resolver.sourceExts, 'mjs', 'cjs'];

// Resolve Zustand as CommonJS to avoid import.meta issues in Expo Web
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName.startsWith('zustand')) {
    const result = require.resolve(moduleName);
    return context.resolveRequest(context, result, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
