module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        modules: 'auto',
        targets: {
          browsers: 'Chrome 70'
        }
      }
    ],
    '@babel/preset-react'
  ]
};
