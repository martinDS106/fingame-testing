const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Force Zustand CJS on web — ESM build uses import.meta and breaks classic script bundles.
const resolveRequest = config.resolver.resolveRequest;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (
    platform === 'web' &&
    (moduleName === 'zustand' || moduleName.startsWith('zustand/'))
  ) {
    return {
      type: 'sourceFile',
      filePath: require.resolve(moduleName),
    };
  }
  if (resolveRequest) {
    return resolveRequest(context, moduleName, platform);
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = withNativeWind(config, { input: './global.css' });
