import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default {
  input: 'src/EmotiveDemoBundle.js',
  output: {
    file: 'dist/emotive-demo.min.js',
    format: 'umd',
    name: 'EmotiveDemo',
    compact: true,
    generatedCode: {
      constBindings: true,
      arrowFunctions: true,
      objectShorthand: true
    }
  },
  plugins: [
    resolve({
      browser: true,
      preferBuiltins: false
    }),
    commonjs(),
    terser({
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info', 'console.debug', 'console.warn'],
        passes: 5,
        unsafe: true,
        unsafe_comps: true,
        unsafe_Function: true,
        unsafe_math: true,
        unsafe_proto: true,
        unsafe_regexp: true,
        unsafe_undefined: true,
        sequences: true,
        dead_code: true,
        conditionals: true,
        booleans: true,
        unused: true,
        if_return: true,
        join_vars: true,
        reduce_vars: true,
        collapse_vars: true,
        inline: true,
        hoist_funs: true,
        hoist_vars: true,
        switches: true,
        loops: true,
        negate_iife: true,
        properties: true,
        side_effects: true,
        warnings: false,
        global_defs: {
          DEBUG: false
        }
      },
      mangle: {
        eval: true,
        toplevel: true,
        properties: false // Keep this false to not break method calls
      },
      format: {
        comments: false,
        beautify: false,
        ecma: 2015,
        indent_level: 0,
        quote_style: 0,
        wrap_iife: true,
        wrap_func_args: false
      },
      keep_classnames: false,
      keep_fnames: false,
      safari10: true
    })
  ],
  treeshake: {
    moduleSideEffects: false,
    propertyReadSideEffects: false,
    tryCatchDeoptimization: false
  }
};