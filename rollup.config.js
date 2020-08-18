import replace from 'rollup-plugin-replace';
import babel from 'rollup-plugin-babel';
// import eslint from 'rollup-plugin-eslint';
import resolve from 'rollup-plugin-node-resolve';
import { uglify } from 'rollup-plugin-uglify';
import commonjs from 'rollup-plugin-commonjs';

const replaceEnvs = Object.keys(process.env)
  .reduce((result, key) => {
    result[`process.env.${key}`] = JSON.stringify(process.env[key]);
    return result;
  }, {});

export default {
  input: 'src/index.js',
  output: {
    file: `dist/${process.env.ENVIRONMENT}/engagement-tracking-${process.env.ENVIRONMENT}.js`,
    format: 'iife',
    sourceMap: 'inline'
  },
  plugins: [
    replace({
      ...replaceEnvs
    }),
    (process.env.ENVIRONMENT === 'prod' && uglify()),
    babel({
      exclude: 'node_modules/**',
      babelrc: true,
    }),
    resolve({
      jsnext: true,
      main: true,
      browser: true,
    }),
    commonjs()
  ]
}
