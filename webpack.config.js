const path = require('path');
const webpack = require('webpack');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const Dotenv = require('dotenv-webpack');
const CopyPlugin = require('copy-webpack-plugin');
const WorkboxPlugin = require('workbox-webpack-plugin');

const isDevelopment = process.env.NODE_ENV !== 'production';

// it doesn’t work
const withReactRefresh = true;

const OUTPUT_PATH = path.join(__dirname, 'out');

module.exports = {
  devServer: {
    host: 'localhost',
    port: '3000',
    hot: true,
    contentBase: OUTPUT_PATH,
    compress: true,
    historyApiFallback: true,
  },
  mode: isDevelopment ? 'development' : 'production',
  // entry: ['react-hot-loader/patch', path.join(__dirname, '/src/index.tsx')],
  entry: {
    ...(isDevelopment && withReactRefresh
      ? {
          reactRefreshSetup:
            '@pmmmwh/react-refresh-webpack-plugin/client/ReactRefreshEntry.js',
        }
      : null),
    main: './src/index.tsx',
  },
  output: {
    filename: '[name].js',
    path: OUTPUT_PATH,
  },
  optimization: {
    runtimeChunk: 'single',
    // Ensure `react-refresh/runtime` is hoisted and shared
    // Could be replicated via a vendors chunk
    splitChunks: {
      chunks: 'all',
      name(_, __, cacheGroupKey) {
        return cacheGroupKey;
      },
    },
  },
  module: {
    rules: [
      {
        test: /\.[jt]sx?$/,
        exclude: /node_modules/,
        use: [
          {
            loader: require.resolve('babel-loader'),
            options: {
              presets: [
                '@babel/react',
                '@babel/typescript',
                ['@babel/env', { modules: false }],
              ],
              plugins: [
                '@babel/plugin-transform-runtime',
                ['module-resolver', { alias: { '@': './src' } }],
                isDevelopment && withReactRefresh && 'react-refresh/babel',
              ].filter(Boolean),
            },
          },
        ],
      },
      {
        enforce: 'pre',
        test: /\.js$/,
        loader: 'source-map-loader',
        exclude: /node_modules/,
      },
      {
        test: /\.(jpe?g|png|gif|svg)$/i,
        loader: 'url-loader',
        options: {
          limit: 10000,
        },
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js'],
  },
  plugins: [
    new Dotenv(),
    new webpack.EnvironmentPlugin({
      NODE_ENV: 'development',
    }),
    new CopyPlugin({
      patterns: [
        {
          from: 'public',
          globOptions: {
            ignore: ['**/index.html'],
          },
        },
      ],
    }),
    new HTMLWebpackPlugin({
      template: 'public/index.html',
      filename: 'index.html',
      inject: true,
    }),
    new WorkboxPlugin.InjectManifest({
      swSrc: './src/sw.ts',
      maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
    }),
    isDevelopment && new webpack.HotModuleReplacementPlugin(),
    isDevelopment && withReactRefresh && new ReactRefreshWebpackPlugin(),
  ].filter(Boolean),
};
