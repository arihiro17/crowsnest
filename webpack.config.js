var webpack = require('webpack');

var IS_DEVELOP = process.env.NODE_ENV === 'dev';
var IS_STAGE = process.env.NODE_ENV === 'stg';
var IS_PROD = process.env.NODE_ENV === 'prod';

var mode = 'development';
if (IS_PROD) {
  mode = 'production';
}

module.exports = {
  mode: 'development',
  entry: './src/index.js',
  output: {
    path: `${__dirname}/dist`,
    filename: 'main.js'
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    alias: {
      GLTFLoader: 'three/examples/js/loaders/GLTFLoader.js'
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      THREE: 'three'
    }),
    // new webpack.ProvidePlugin({
    //   GUIVR: 'datguivr'
    // })
  ],
  module: {
    rules: [
      {
        test: /\.js$/,
        use: [
          {
            loader: 'babel-loader',
            options: {
              presets: [
                '@babel/preset-env'
              ]
            }
          }
        ]
      },
      // Three.jsを外出し
      // { test: /\/three\.js$/, loader: 'expose-loader?THREE' },
    ]
  }
};
