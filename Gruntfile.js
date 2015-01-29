'use strict';

module.exports = function (grunt) {

  // Load grunt tasks
  require('load-grunt-tasks')(grunt);

  // Time how long tasks take. Can help when optimizing build times
  require('time-grunt')(grunt);

  var fs = require('fs');

  // Define the configuration for all the tasks
  grunt.initConfig({

    copy: {
      dist: {
        expand: true,
        cwd: 'src',
        src: ['deepCopy.js'],
        dest: 'dist/'
      }
    },

    uglify: {
      dist: {
        files: {
          'dist/deepCopy.min.js': ['dist/deepCopy.js']
        },
        options: {
          banner: '/* Copyright 2015 Oran Looney. https://github.com/olooney/deep-copy-js/blob/master/LICENSE.txt */\n'
        }
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        reporter: require('jshint-stylish')
      },
      all: {
        src: [
          'Gruntfile.js',
          'src/**/*.js'
        ]
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/**/*.js']
      }
    },

    karma: {
      options: {
        captureTimeout: 60000 * 5,
        singleRun: true,
        frameworks: ['jasmine', 'sinon'],
        files: [
          'src/deepCopy.js',
          'test/spec/**.*.js'
        ],
        preprocessors: {
          'src/deepCopy.js': 'coverage'
        },
        coverageReporter: {
          type: 'html'
        },
        sauceLabs: {
          username: process.env.SAUCE_USERNAME,
          accessKey: process.env.SAUCE_ACCESS_KEY,
          testName: 'deep-copy-js, browser: ' + process.env.BROWSER
        },
        reporters: ['saucelabs', 'coverage', 'mocha'],
        customLaunchers: JSON.parse(fs.readFileSync('test/browsers.json'))
      },
      continuous: {
        browsers: ['PhantomJS']
      },
      sauceTask: (function() {
        var config = {
          browsers: [
            process.env.BROWSER
          ]
        };
        if (process.env.BROWSER === 'ie6') {
          // Support IE6: Default socket.io transport doesn't work on IE6
          config.transports = [ 'jsonp-polling' ];
        }
        return config;
      })(),
      // Testers for dist build files
      dist: {
        options: {
          browsers: [
            'PhantomJS'
          ],
          files: [
            'dist/deepCopy.js',
            'test/spec/**/*.js'
          ]
        }
      },
      distMin: {
        options: {
          browsers: [
            'PhantomJS'
          ],
          files: [
            'dist/deepCopy.min.js',
            'test/spec/**/*.js'
          ]
        }
      }
    }
  });

  var usePhantom = process.env.TRAVIS_PULL_REQUEST !== 'false' || process.env.BROWSER === 'phantomjs';
  var tasks = ['newer:jshint','copy', 'uglify'];
  var travisTasks = usePhantom ? tasks.concat('karma:continuous') : tasks.concat('karma:sauceTask');
  var distTasks = tasks.concat(['karma:dist', 'karma:distMin']);

  grunt.registerTask('default', tasks.concat('karma:continuous'));
  grunt.registerTask('default:travis', travisTasks);
  grunt.registerTask('distBuild', distTasks);
};
