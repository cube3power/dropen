// Karma configuration
// Generated on Wed Nov 09 2016 00:04:58 GMT+0900 (JST)

module.exports = function(config) {
  config.set({

    basePath: '',

    frameworks: ['mocha'],

    files: [
      'test/index.html',
      'test/**/*.js'
    ],

    exclude: [
    ],

    preprocessors: {
      'test/**/*.js': ['webpack', 'coverage'],
      'test/**/*.html': 'html2js'
    },

    reporters: ['spec', 'coverage'],

    coverageReporter: {
      reporters: [{type: 'lcov'}]
    },
    
    port: 9876,

    colors: true,

    logLevel: config.LOG_INFO,

    autoWatch: true,

    browsers: ['PhantomJS'],

    singleRun: false,

    webpack: require('./webpack.config.js'),

    concurrency: Infinity
  });
}
