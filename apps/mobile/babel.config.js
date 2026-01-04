module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // NativeWind for Tailwind CSS styling
    'nativewind/babel',
    // Reanimated must be listed last
    'react-native-reanimated/plugin',
  ],
};
