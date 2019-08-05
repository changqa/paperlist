const path = require('path')

module.exports = {
    entry: '',
    output: {
        filename: "main.js",
        path: path.resolve(__dirname, 'dist')
    },
    mode: 'production'
}