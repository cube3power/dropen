// Karma configuration
// Generated on Wed Nov 09 2016 00:04:58 GMT+0900 (JST)

module.exports = function(config) {
  config.set({

    basePath: '',

    frameworks: ['mocha', 'browserify'],

    files: [
      'index.js',
      'test/index.html',
      'test/**/*.js'
    ],

    exclude: [
    ],

    preprocessors: {
      './**/*.js': ['coverage'],
      'test/**/*.js': ['browserify'],
      'test/**/*.html': 'html2js'
    },

    browserify: {
      debug: true,
      transform: [
        ['babelify', {plugins: ['babel-plugin-espower']}]
      ]
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

    concurrency: Infinity
  })
}
