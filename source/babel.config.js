const isTest = process.env.NODE_ENV === 'test';

module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    ...(isTest ? [] : [
      'react-native-worklets-core/plugin',
      [
        'module-resolver',
        {
          root: ['.'],
          extensions: ['.ts', '.tsx', '.js', '.jsx'],
          alias: {
            '@camera': './src/camera',
            '@components': './src/components',
            '@hooks': './src/hooks',
            '@navigation': './src/navigation',
            '@screens': './src/screens',
            '@types': './src/types',
            '@utils': './src/utils',
            '@vision': './src/vision',
            '@height': './src/height',
            '@db': './src/database',
            '@sync': './src/sync',
            '@network': './src/network',
          },
        },
      ],
      'react-native-reanimated/plugin',
    ]),
  ],
};
