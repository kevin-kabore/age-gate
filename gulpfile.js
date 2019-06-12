'use strict';

const gulp = require('gulp');
const babel = require('gulp-babel'); // es6
/*===================================================
Begin gulp plugins
===================================================*/

/** JS Processors */
const eslint = require('gulp-eslint'); //js lint
const uglify = require('gulp-uglify'); //minify javascript

/** SASS & CSS Processors */
const autoprefixer = require('gulp-autoprefixer'); //adding vendor prefixes
const sass = require('gulp-sass'); //sass compiling
const cssnano = require('gulp-cssnano'); //minify css

/** HTML Processors */
const useref = require('gulp-useref'); //read html to determine how to combine files
const htmlhint = require('gulp-htmlhint'); //validate html files

/** Image Processors */
const imagemin = require('gulp-imagemin'); //image optimization
const cache = require('gulp-cache'); //cache already processed images to speed up future jobs

/** Gulp Processors */
const plumber = require('gulp-plumber'); //handles pipe errors so watch tasks don't fail on errors
const notify = require('gulp-notify'); //display plumber errors in the terminal
const sort = require('sort-stream'); //sort streams
const gulpIf = require('gulp-if'); //allow conditionals in pipes
const exec = require('child_process').exec; // allow running of cli commands
const browsersync = require('browser-sync').create(); //allow the browser to automatically sync with local changes

/** File/Directory Management Processors */
const concat = require('gulp-concat'); //conctenate files
const del = require('del'); //delete folders for clean up
const sourcemaps = require('gulp-sourcemaps'); //generates source maps

/*===================================================
End gulp plugins
===================================================*/

function exec_cmd(callback, cmd) {
  if (Array.isArray(cmd)) {
    cmd = cmd.join('\n');
  }

  var p = exec(cmd, function(err) {
    callback(err);
  });

  p.stdout.pipe(process.stdout);
}

//Display error messages in the console in a readable format
function onError(error) {
  notify.onError({
    //display the error message in the console
    message: error.message
  })(error);
  this.emit('end'); //allow task to end gracefully without killing watch tasks
}

// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: './build'
    },
    port: 3000
  });
  done();
}

// BrowserSync Reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

//delete the build folder, this is used when preparing a final build to remove any files that are no longer needed
function clean() {
  return del(['./build/**/*']);
}

//clear the cache for imagemin
function clearcache(done) {
  return cache.clearAll(done);
}

function jsHint() {
  return gulp
    .src(['src/js/**/*.js', '!src/js/lib/**/*.js', '!src/js/**/*.min.js']) // path to your files excluding lib folder and .min files
    .pipe(
      plumber({
        errorHandler: onError
      })
    ) //if the validator crashes, fail gracefully
    .pipe(
      eslint({
        globals: ['jQuery', '$']
      })
    ) //validate the javascript
    .pipe(eslint.format()) //format the error output for easy readability
    .pipe(eslint.failAfterError());
}

function jsMinify() {
  return gulp
    .src([
      'node_modules/babel-polyfill/dist/polyfill.js',
      'src/js/lib/**/*.js',
      'src/js/**/*.js'
    ]) // path to your files, put all code modules in lib to avoid undefined errors
    .pipe(babel())
    .pipe(
      sort(function(a, b) {
        // make sure site.js is loaded last
        var aScore = a.path.match(/site.js$/) ? 1 : 0;
        var bScore = b.path.match(/site.js$/) ? 1 : 0;
        return aScore - bScore;
      })
    )
    .pipe(sourcemaps.init()) //initialize creating the sourcemap
    .pipe(concat('main.min.js')) //combine all javascript files into a single file
    .pipe(
      plumber({
        errorHandler: onError
      })
    ) //if the minifier crashes, fail gracefully
    .pipe(uglify()) //minify the javascript
    .pipe(sourcemaps.write('.')) //generate the final sourcemap
    .pipe(gulp.dest('build/js')) //write the finished file to the destination
    .pipe(browsersync.stream());
}

function scss() {
  del(['./src/css/generated']);
  return gulp
    .src('src/scss/**/*.scss')
    .pipe(
      plumber({
        errorHandler: onError
      })
    ) //if the SASS parser crashes, fail gracefully
    .pipe(sass()) // Using gulp-sass
    .pipe(gulp.dest('src/css/generated'));
}

function css() {
  return gulp
    .src('src/css/**/*.css')
    .pipe(sourcemaps.init()) //initialize creating the sourcemap
    .pipe(
      autoprefixer({
        //add vendor prefixes for browsers in our support table
        overrideBrowserslist: [
          'Chrome >= 32',
          'ie >=9',
          'Firefox >=27',
          'Safari >=7',
          'last 2 Opera versions',
          'iOS >= 6',
          'Android >= 4'
        ],
        cascade: false
      })
    )
    .pipe(
      plumber({
        errorHandler: onError
      })
    ) //if the minifier crashes, fail gracefully
    .pipe(cssnano()) //minify css
    .pipe(concat('main.min.css')) //combine all css files into a single file
    .pipe(sourcemaps.write('.')) //generate the final sourcemap
    .pipe(gulp.dest('build/css'))
    .pipe(browsersync.stream());
}

function images() {
  //optimize all image files
  return (
    gulp
      .src('src/img/**/*.+(png|jpg|jpeg|gif|svg)')
      // Caching images that ran through imagemin, cached files will be skipped unless they have been altered
      .pipe(
        cache(
          imagemin({
            interlaced: true
          })
        )
      )
      .pipe(gulp.dest('build/img'))
  );
}

function fonts() {
  //copy over fonts, since fonts are already optimized we only need to copy them as is
  return gulp.src('src/fonts/**/*').pipe(gulp.dest('build/fonts'));
}

function data() {
  //copy over json
  return gulp
    .src('src/data/**/*')
    .pipe(gulp.dest('build/data'))
    .pipe(browsersync.stream());
}

function media() {
  //copy any miscellaneous media files over
  return gulp.src('src/media/**/*').pipe(gulp.dest('build/media'));
}

function htmlHint() {
  //validate html files
  return gulp
    .src('src/**/*.html')
    .pipe(
      plumber({
        errorHandler: onError
      })
    ) //if the validator crashes, fail gracefully
    .pipe(htmlhint())
    .pipe(htmlhint.reporter('htmlhint-stylish'));
}

function copyPages() {
  //copy all html and php files over
  return gulp
    .src('src/**/*.+(html|php)')
    .pipe(gulp.dest('build/'))
    .pipe(browsersync.stream());
}

function watchFiles() {
  //watch for changes to HTML, CSS, SASS and javascript files and automatically process them
  gulp.watch(
    ['src/scss/**/*.scss', 'src/css/**/*.css', '!src/css/generated/**/*'],
    gulp.series(styles)
  );
  gulp.watch(['src/js/**/*.js'], gulp.series(scripts));
  gulp.watch(['src/**/*.html'], gulp.series(pages));
  gulp.watch(['src/**/*.json'], gulp.series(data));
}

const pages = gulp.series(
  htmlHint, //make sure the html validates before trying to copy it
  gulp.parallel(copyPages)
);

//validate and minify scripts
const scripts = gulp.series(
  jsHint, //make sure the javascript validates before trying to minify it
  gulp.parallel(jsMinify)
);

//Parse SASS and process css
const styles = gulp.series(
  scss, //make sure all SASS files are parsed before concatenating and minifying css
  gulp.parallel(css)
);

const watch = gulp.parallel(watchFiles, browserSync);

const build = gulp.series(
  clean,
  gulp.parallel(styles, scripts, images, fonts, media, pages, data)
);

const develop = gulp.series(build, watch);

//export tasks
exports.pages = pages;
exports.scripts = scripts;
exports.styles = styles;
exports.watch = watch;
exports.build = build;
exports.default = develop;
