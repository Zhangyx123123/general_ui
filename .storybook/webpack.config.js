'use strict'
const path = require('path');
const utils = require('../build/utils')
const vueLoaderConfig = require('../build/vue-loader.conf')
const config = require('../config')
const marked = require('marked');

function resolve (dir) {
  return path.join(__dirname, '..', dir)
}

// load the default config generator.
const genDefaultConfig = require('@storybook/vue/dist/server/config/defaults/webpack.config.js');

const createLintingRule = () => ({
  test: /\.(js|vue)$/,
  loader: 'eslint-loader',
  enforce: 'pre',
  include: [resolve('src'), resolve('test')],
  options: {
    formatter: require('eslint-friendly-formatter'),
    emitWarning: !config.dev.showEslintErrorsInOverlay
  }
})

const renderer = new marked.Renderer();

renderer.heading = (text, level) => {
  if (level === 3) {
    return `<h${level} style="color: #6d6c6c;">${text}</h${level}>`;
  }
  return `<h${level}>${text}</h${level}>`
};
renderer.code = (code, language, escaped) => {
  let escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<div style="background-color: #eeeeee; border-radius: 2px;"><pre style="padding: 10px;">${escapedCode}</pre></div>`;
};
renderer.codespan = (code) => {
  let escapedCode = code.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  return `<code style="background-color: #eeeeee; padding:3px 5px; border-radius: 2px;">${code}</code>`
};
renderer.table = (header, body) => {
  return `<table style="border-collapse: collapse"><thead style="font-weight:bold; background-color:#f7f7f7; padding: 10px;">${header}</thead><tbody>${body}</tbody></table>`
};
renderer.tablecell = (content, flags) => {
  return `<td style="padding: 5px; font-size: 16px; border: 1px solid lightgray;">${content}</td>`;
};


module.exports = (baseConfig, env) => {
  const config = genDefaultConfig(baseConfig, env);

  // Extend it as you need.
  function resolve(dir) {
    return path.join(__dirname, '..', dir);
  }

  config.resolve = {
    extensions: ['.js', '.vue', '.json', '.scss', '.html', '.svg'],
    alias: {
      'vue$': 'vue/dist/vue.esm.js',
      '@': resolve('src'),
    }
  };
  config.module = {
    rules: [
      ...[createLintingRule()],
      {
        test: /\.html$/,
        loader: "html-loader"
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
        options: vueLoaderConfig
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        include: [resolve('src'), resolve('test'), resolve('node_modules/webpack-dev-server/client')]
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('img/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('media/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          name: utils.assetsPath('fonts/[name].[hash:7].[ext]')
        }
      },
      {
        test: /\.s[a|c]ss$/,
        // loader: 'style!css!sass'
        use: [
          {
            loader: 'style-loader' // Adds CSS to the DOM by injecting a <style> tag
          },
          {
            loader: 'css-loader', //  interprets @import and url() like import/require() and will resolve them.
          },
          {
            loader: 'postcss-loader', // postcss loader so we can use autoprefixer
            options: {
              config: {
                path: '../postcssrc.js'
              },
              plugins: function() { return []; } //had to add this line to avoid Error: No PostCSS Config found in ...
            }
          },
          {
            loader: 'sass-loader', // compiles Sass to CSS
          }
        ],
      },
      {
        test: /\.md$/,
        use: [
          {
            loader: "html-loader"
          },
          {
            loader: "markdown-loader",
            options: {
              renderer,
              tables: true,
            }
          }
        ]
      },
    ]
  };

  return config;
};