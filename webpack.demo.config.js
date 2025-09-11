import path from 'path';
import { fileURLToPath } from 'url';
import TerserPlugin from 'terser-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
  mode: 'production',
  devtool: false, // Explicitly disable source maps
  entry: './src/EmotiveDemoBundle.js',
  target: 'web',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'emotive-demo.min.js',
    library: 'EmotiveDemo',
    libraryTarget: 'umd',
    libraryExport: 'default',
    globalObject: 'this'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-env'],
            plugins: ['@babel/plugin-transform-runtime']
          }
        }
      }
    ]
  },
  optimization: {
    minimize: true,
    moduleIds: 'deterministic',
    chunkIds: 'deterministic',
    mangleExports: true,
    concatenateModules: true,
    minimizer: [
      new TerserPlugin({
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
            passes: 3,
            module: true,
            toplevel: true
          },
          mangle: {
            // Don't mangle properties - it breaks method calls
            properties: false,
            // Keep class and function names for compatibility
            keep_classnames: true,
            keep_fnames: true,
            module: true,
            toplevel: true
          },
          format: {
            comments: false
          },
          module: true,
          toplevel: true
        },
        extractComments: false
      })
    ]
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      '@': path.resolve(__dirname, 'src'),
    }
  }
};