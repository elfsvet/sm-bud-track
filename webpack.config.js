const path = require('path');

module.exports = {
    entry: {
        // relative path here
        app: './src/app.js'
    },
    output: {
        // output path to dist folder
        path: path.resolve(__dirname,'/dist'),
        filename: 'bundle.js'
    },
    // development mode instead of production
    mode: 'development'

}