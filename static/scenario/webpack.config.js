"use strict";
module.exports = {
    entry: "./js/scenario_wizard_mode.js",
    output: {
        filename: "./dist/build.js"
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                loader: "babel-loader",
                exclude: /node_modules/
            },
            {
                test: /\.vue$/,
                loader: 'vue-loader'
            },
            {
                test: /\.css$/,
                use: [
                    {
                    loader: 'style-loader'
                    },
                    {
                    loader: 'css-loader'
                    }
                ]
            },
            {
                test: /\.(scss|sass)$/,
                use: [
                    {
                        loader: 'style-loader'
                    },
                    {
                        loader: 'css-loader'
                    },
                    {
                        loader: 'sass-loader'
                    }
                ]
            }
        ]
    },
    resolve: {
        extensions: ['.js', '.vue'],
        alias: {
            // 'vue':'vue/dist/vue.js',
            'vue':'./js/vue-2.4.2.js',
        }
    }
};