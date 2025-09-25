import path from 'path';
import { fileURLToPath } from 'url';
import TerserPlugin from 'terser-webpack-plugin';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default {
    mode: 'production',
    entry: './src/EmotiveMascotPublic.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'emotive-engine.min.js',
        library: 'EmotiveMascot',
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
        minimizer: [
            new TerserPlugin({
                terserOptions: {
                    compress: {
                        drop_console: true,
                        drop_debugger: true,
                        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn']
                    },
                    mangle: {
                        properties: {
                            regex: /^_/ // Mangle private properties starting with underscore
                        }
                    },
                    format: {
                        comments: false
                    }
                },
                extractComments: false
            })
        ]
    },
    resolve: {
        extensions: ['.js'],
        alias: {
            '@': path.resolve(__dirname, 'src'),
            'core': path.resolve(__dirname, 'src/core'),
            'utils': path.resolve(__dirname, 'src/utils')
        }
    },
    performance: {
        maxEntrypointSize: 512000,
        maxAssetSize: 512000
    }
};