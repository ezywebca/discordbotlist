const webpack = require('webpack');
const path = require('path');

const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const VueLoaderPlugin = require('vue-loader/lib/plugin');

const VueSSRServerPlugin = require('vue-server-renderer/server-plugin');

const prod = process.env.NODE_ENV && process.env.NODE_ENV.toLowerCase() === 'production';

const shared = {
	mode: prod ? 'production' : 'development',
	resolve: {
		alias: {
			vue$: 'vue/dist/vue.esm.js'
		},
		extensions: ['.js', '.vue']
	},
	module: {
		rules: [{
			test: /\.vue$/,
			loader: 'vue-loader'
		},
		{
			test: /\.js$/,
			exclude: /(node_modules)/,
			use: {
				loader: 'babel-loader',
				options: {
					presets: ['es2015'],
					plugins: ['transform-async-to-generator']
				}
			}
		},
		{
			test: /\.css$/,
			loaders: ['vue-style-loader', 'css-loader']
		},
		{
			test: /\.(scss|sass)$/,
			include: [/node_modules/, path.join(__dirname, 'webapp', 'scss', 'app.scss')],
			use: [MiniCssExtractPlugin.loader,  'css-loader', 'sass-loader']
		},
		{
			test: /\.(ttf|otf|eot|svg|woff(2)?)(\?[a-z0-9]+)?$/,
			loader: 'file-loader?name=fonts/[name].[ext]'
		},
		{
			test: /\.(png|jpe?g|gif)$/,
			use: ['url-loader']
		}]
	}
};

module.exports = [
	{
		entry: [
			path.join(__dirname, 'webapp', 'js', 'entry-client.js'),
			path.join(__dirname, 'webapp', 'scss', 'app.scss')
		],
		output: {
			filename: 'js/app-[chunkhash].js',
			path: path.join(__dirname, 'public'),
			publicPath: '/',
		},
		plugins: [
			new VueLoaderPlugin(),
			new MiniCssExtractPlugin({
				filename: 'css/app-[chunkhash].css'
			}),
			new webpack.DefinePlugin({
				'process.env': {
					NODE_ENV: `'${prod ? 'production' : 'development'}'`
				},
			}),
			new HtmlWebpackPlugin({
				template: path.join(__dirname, 'webapp', 'index-template.html'),
				minify: {
					collapseWhitespace: true,
					preserveLineBreaks: false
				},
				filename: path.join(__dirname, 'build', 'index.html'),
			})
		],
		...shared
	},

	{
		target: 'node',
		// Uncommented to speed up things
		// devtool: prod ? 'sourcemap' : false,
		entry: [
			path.join(__dirname, 'webapp', 'js', 'entry-server.js')
		],
		output: {
			filename: 'ssr.js',
			path: path.resolve(__dirname, 'build'),
			libraryTarget: 'commonjs2'
		},
		plugins: [
			new VueLoaderPlugin(),
			new webpack.DefinePlugin({
				'process.env': {
					NODE_ENV: `'${prod ? 'production' : 'development'}'`
				},
				'process.env.VUE_ENV': '"server"'
			}),

			new VueSSRServerPlugin(),
		],

		...shared
	}
];
