module.exports = function (api) {
  api.cache(true);
  return {
    presets: [
      [
        'babel-preset-expo',
        {
          jsxImportSource: 'nativewind',
          // Zustand persist (and other ESM deps) use import.meta — required for Expo Web.
          unstable_transformImportMeta: true,
        },
      ],
      'nativewind/babel',
    ],
  };
};
