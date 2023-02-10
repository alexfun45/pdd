const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin')

module.exports = {
	mode: 'development',
	//watchOptions: {
		//ignored: ['**/sys/*', '**/node_modules'],
	//},
	watchOptions: {
	  poll: true,
	  ignored: /node_modules/
	},
	entry: ["core-js/actual", "@babel/polyfill",'./src/index.tsx'],
	output: {
		path: path.resolve(__dirname, 'js'),
		filename: 'main.bundle.[hash].js',
		publicPath: './js/'
	},
	resolve: {
		alias: {
			'@': path.resolve(__dirname, 'src'),
			'~': path.resolve(__dirname, 'node_modules')
		  },
		extensions: ['*', '.js', '.jsx', '.json', '.ts', '.tsx']
	},
	module: {
		rules:[
			{
				test: /\.s[ac]ss$/i,
				use: [
				  // Creates `style` nodes from JS strings
				  "style-loader",
				  // Translates CSS into CommonJS
				  "css-loader",
				  // Compiles Sass to CSS
				  "sass-loader",
				],
			},
			{
				test: /\.css$/i, use: ["style-loader", "css-loader"]
			},
			/*{
				exclude: /(node_modules)/,
				test: /.\/sys\/components\/.*\/.*\.jsx?$/,
				loader: 'babel-loader'
			},*/
			{
				exclude: /(node_modules)/,
				test: /\.jsx?$/, use: ['babel-loader']
			},
			{
                test: /\.(ts|tsx)$/,
                exclude: /node_modules/,
                use: ["ts-loader"],
            },
		]
	},
	plugins: [
		new CleanWebpackPlugin(),
		new HtmlWebpackPlugin({
			filename: '../index.html',
			template: './src/index.html'
		}),
		/*new CopyPlugin({
			patterns: [
			{ 
				from:  path.resolve(__dirname, './src/assets/'),
				to:  path.resolve(__dirname, 'js/assets/')
			},
			{
				from:  path.resolve(__dirname, './src/assets/icons/'),
				to:  path.resolve(__dirname, 'js/assets/icons/')
			}
		]}
		)*/
	  ],
}