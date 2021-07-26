import * as path from 'path';
import DevServer from 'webpack-dev-server';
import * as webpack from 'webpack';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import HTMLWebpackPlugin from 'html-webpack-plugin';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import DotenvPlugin from 'dotenv-webpack';
import CopyPlugin from 'copy-webpack-plugin';
import WorkboxPlugin from 'workbox-webpack-plugin';
import SentryWebpackPlugin from '@sentry/webpack-plugin';

declare module 'webpack' {
  interface Configuration {
    devServer?: DevServer.Configuration | undefined;
  }
}

const isDevelopment = process.env.NODE_ENV !== 'production';

const withReactRefresh = true;

type Target = 'web' | 'extension';

const options = {
  web: {
    outputPath: path.join(__dirname, 'out'),
    devServerPort: 3000,
    entry: './src/index.tsx',
    assetsPath: 'public',
  },
  extension: {
    outputPath: path.join(__dirname, 'dist-extension'),
    devServerPort: 3001,
    entry: './src/index.extension.tsx',
    assetsPath: 'extension',
  },
};
function webpackConfiguration(target: Target): webpack.Configuration {
  const opts = options[target];
  return {
    name: target,
    mode: isDevelopment ? 'development' : 'production',
    devServer: {
      host: 'localhost',
      port: opts.devServerPort,
      hot: true,
      contentBase: opts.outputPath,
      compress: true,
      historyApiFallback: true,
      writeToDisk: true,
      // transportMode: 'ws',
      transportMode: {
        server: 'ws',
        // Override client for extension to properly support hot
        // reload. The custom client is simply hard-coding the server
        // location, so it does not use host-relative urls which
        // result in trying to connect to moz-extension:///sock-js
        client: target === 'extension' ? require.resolve('./wsclient') : 'ws',
      } as any,
      disableHostCheck: target === 'extension',
    },
    entry: {
      ...(isDevelopment && withReactRefresh
        ? {
            reactRefreshSetup:
              '@pmmmwh/react-refresh-webpack-plugin/client/ReactRefreshEntry.js',
          }
        : null),
      main: opts.entry,
    },
    output: {
      filename: '[name].js',
      publicPath: '/',
      path: opts.outputPath,
    },
    optimization: {
      runtimeChunk: 'single',
      // Ensure `react-refresh/runtime` is hoisted and shared
      // Could be replicated via a vendors chunk
      splitChunks: {
        chunks: 'all',
        // name(_, __, cacheGroupKey) {
        //   return cacheGroupKey;
        // },
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
                sourceType: 'unambiguous',
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
        {
          test: /\.css$/i,
          use: ['style-loader', 'css-loader'],
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js'],
    },
    devtool: 'source-map',
    plugins: [
      new CleanWebpackPlugin({
        cleanStaleWebpackAssets: false,
      }),

      new DotenvPlugin(),

      new webpack.EnvironmentPlugin({
        NODE_ENV: 'development',
      }),

      new CopyPlugin({
        patterns: [
          {
            from: opts.assetsPath,
            globOptions: {
              ignore: ['**/index.html'],
            },
          },
        ],
      }),

      new HTMLWebpackPlugin({
        template: path.join(opts.assetsPath, 'index.html'),
        filename: 'index.html',
        inject: true,
      }),

      target === 'web' &&
        new WorkboxPlugin.InjectManifest({
          swSrc: './src/sw.ts',
          maximumFileSizeToCacheInBytes: 10 * 1024 * 1024,
        }),

      isDevelopment && new webpack.HotModuleReplacementPlugin(),

      isDevelopment && withReactRefresh && new ReactRefreshWebpackPlugin(),

      target === 'web' &&
        !isDevelopment &&
        new SentryWebpackPlugin({
          org: 'rasendubi',
          project: 'readily',

          include: opts.outputPath,
          ignore: ['node_modules', 'webpack.config.js'],
        }),
    ].filter(Boolean) as webpack.WebpackPluginInstance[],
  };
}

module.exports = [
  webpackConfiguration('web'),
  webpackConfiguration('extension'),
];
