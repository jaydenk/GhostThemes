const { src, dest, watch, series, parallel } = require('gulp');
const pump = require('pump');
const postcss = require('gulp-postcss');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const zip = require('gulp-zip').default || require('gulp-zip');
const beeper = require('beeper').default || require('beeper');

// PostCSS plugins
const easyimport = require('postcss-easy-import');
const autoprefixer = require('autoprefixer');
const cssnano = require('cssnano');

// Livereload
let livereloadServer;
function initLivereload(done) {
    const livereload = require('gulp-livereload');
    livereloadServer = livereload;
    livereloadServer.listen();
    done();
}

function handleError(done) {
    return function(err) {
        if (err) {
            beeper();
            console.error(err);
        }
        return done(err);
    };
}

// Build CSS
function buildCSS(done) {
    pump([
        src('assets/css/screen.css', { sourcemaps: true }),
        postcss([
            easyimport,
            autoprefixer(),
            cssnano({
                preset: ['default', {
                    cssDeclarationSorter: false,
                    mergeLonghand: false,
                    mergeRules: false
                }]
            })
        ]),
        dest('assets/built/', { sourcemaps: '.' })
    ], handleError(done));
}

// Build JS
function buildJS(done) {
    pump([
        src([
            'assets/js/main.js'
        ], { sourcemaps: true }),
        concat('main.min.js'),
        uglify(),
        dest('assets/built/', { sourcemaps: '.' })
    ], handleError(done));
}

// Watch files
function watchFiles() {
    watch('assets/css/**/*.css', buildCSS);
    watch('assets/js/**/*.js', buildJS);
}

// Create zip for distribution
function createZip(done) {
    const pkg = require('./package.json');
    const filename = `${pkg.name}-${pkg.version}.zip`;

    pump([
        src([
            '**',
            '!node_modules', '!node_modules/**',
            '!dist', '!dist/**',
            '!*.zip'
        ]),
        zip(filename),
        dest('dist/')
    ], handleError(done));
}

// Tasks
const build = parallel(buildCSS, buildJS);
const dev = series(build, initLivereload, watchFiles);

exports.build = build;
exports.zip = series(build, createZip);
exports.default = dev;
