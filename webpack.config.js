const prod = process.env.NODE_ENV === 'production';
const path = require('path');
const { DefinePlugin } = require('webpack');

module.exports = {
  entry: './src/app/main/index.ts',
  mode: 'production',
  output: {
    path: path.resolve('./output'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.[jt]s$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env', '@babel/preset-typescript'],
          },
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
    alias: {
      '@app': path.resolve(__dirname, 'src/app'),
      '@assets': path.resolve(__dirname, 'src/assets'),
      '@domain': path.resolve(__dirname, 'src/domain'),
      '@shared': path.resolve(__dirname, 'src/shared'),
      '@mod': path.resolve(__dirname, 'src/mod'),
      '@ui': path.resolve(__dirname, 'src/ui'),
    },
  },
  plugins: [
    new DefinePlugin({
      VERSION: JSON.stringify(require('./package.json').version + (prod ? '' : '-dev')),
    }),
  ],
};
