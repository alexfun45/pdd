const presets = [["@babel/preset-react", {
    "runtime": "automatic"
  }], "@babel/preset-env", "@babel/preset-typescript"]
const plugins = ["@babel/plugin-syntax-dynamic-import","@babel/plugin-proposal-class-properties", "@babel/plugin-transform-arrow-functions", "babel-plugin-transform-remove-undefined"];

module.exports = {"presets": presets, "plugins": plugins}