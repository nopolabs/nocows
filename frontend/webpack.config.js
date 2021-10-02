const path = require('path');

module.exports = {
  entry: path.resolve(__dirname, './src/index.js'),
  module: {
    rules: [
      {
        test: /\.(js)$/,
        exclude: /node_modules/,
        loader: "babel-loader",
        options: {
          presets: [
            '@babel/preset-env',
          ],
          plugins: [
            '@babel/transform-runtime',
          ]
        }
      }
    ]
  },
  resolve: {
    extensions: ['*', '.js'],
    fallback: {
      "crypto": require.resolve("crypto-browserify"),
      "stream": require.resolve("stream-browserify"),
      "buffer": require.resolve("buffer/"),
    },
  },
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'nocows.js',
  },
  watch: false, // require -- watch flag
  watchOptions: {
    aggregateTimeout: 200,
    poll: 1000,
    ignored: /node_modules/,
  },
};
