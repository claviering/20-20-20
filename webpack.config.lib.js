const path = require("path");

module.exports = {
  mode: "production",
  entry: "./src/index.js",
  output: {
    path: path.resolve(__dirname, "media"),
    filename: "timer.min.js",
    library: "timer", // 在全局变量中增加一个library变量
    libraryTarget: "umd"
  }
}