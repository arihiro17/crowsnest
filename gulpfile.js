const gulp = require('gulp');
const $ = require('gulp-load-plugins')({pattern: ['gulp-*', 'gulp.*'], replaceString: /\bgulp[\-.]/});
const runSequence = require('run-sequence');
const webpackStream = require('webpack-stream');
const webpack = require('webpack');
const _ = require('lodash');
const merge = require('event-stream').merge;
const fs = require('fs');
const path = require('path');
const del = require('del');
const pngquant = require('imagemin-pngquant');
const mozjpeg = require('imagemin-mozjpeg');
const browserSync = require('browser-sync');


var IS_DEVELOP = process.env.NODE_ENV == 'dev';
var IS_PROD = process.env.NODE_ENV == 'prod';


gulp.task('server', function() {
  browserSync.init({
    server: {
      baseDir: ['dist'],
      directory: false
    },
    port: 8888,
    open: false,
    notify: false,
  });
});


gulp.task('html', [], function() {
  return gulp.src(['src/html/**/*.html', '!src/html/common/*.html'])
    .pipe($.plumber())
    .pipe($.fileInclude({basepath: './'}))
    .pipe(gulp.dest('dist'))
    .pipe($.if(IS_DEVELOP, browserSync.stream()));
});


var webpackConf = _.extend({}, require('./webpack.config'));
fs.readdirSync('src')
.filter(function(dir){
  return dir.indexOf('.js') > 0;
})
.forEach(function(filename) {
  var key = path.basename(filename, '.js');
  var value = path.resolve(path.join('src', filename));
  webpackConf.entry = webpackConf.entry || {};
  webpackConf.entry[key] = value;
});
if (!IS_PROD) {
  webpackConf.devtool = 'source-map';
}
gulp.task('scripts', function() {
  return gulp.src('src/**/*')
    .pipe($.plumber())
    .pipe(webpackStream(webpackConf, webpack))
    .pipe(gulp.dest('dist'))
    .pipe($.if(IS_DEVELOP, browserSync.stream()));
});

gulp.task('default', [], function(cb) {
  runSequence(['scripts'], cb);
});

gulp.task('start', ['default', 'server'], function() {
  $.watch('src/**/*', function() {
    gulp.start(['scripts']);
  });
});
