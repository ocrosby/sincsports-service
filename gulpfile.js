const gulp = require('gulp');
const gutil = require('gulp-util');
const clean = require('gulp-clean');
const jshint = require('gulp-jshint');
const jsonlint = require('gulp-jsonlint');
const checkstyleFileReporter = require('jshint-checkstyle-file-reporter');
const merge = require('merge-stream');
const runSequence = require('run-sequence');

const details = require('./package.json');

const directories = [ 'coverage', '.nyc_output', 'build' ];

let files = {};

function mergeArguments() {
    let i;
    let arg;
    let result = [];
    let length;

    for (i = 0, length = arguments.length ; i < length ; i++) {
        arg = arguments[i];

        if (Array.isArray(arg)) {
            result = result.concat(arg);
        } else {
            result.push(arg);
        }
    } // end for

    return result;
}

files.src = [ 'src/**/*.js' ];
files.xml = [ '*.xml' ];
files.json = [ 'package.json', 'src/**/*.json' ];
files.test = [ 'test/**/*.spec.js' ];
files.build = mergeArguments( 'package.json', '.npmrc', files.src );
files.javascript = mergeArguments(files.src, files.test);
files.generated = mergeArguments( directories, files.xml, `${details.name}*.*`);

gulp.task('clean', function () {
    return gulp.src(['build', 'dist', '.nyc_output', 'coverage', 'xunit.xml', 'checkstyle.xml'])
        .pipe(clean());
});

// URL: https://www.npmjs.com/package/gulp-jsonlint
// URL: https://www.npmjs.com/package/gulp-jshint
// URL: https://github.com/mila-labs/jshint-checkstyle-file-reporter
gulp.task('lint', () => {
    let jsonFiles = gulp.src(files.json)
        .pipe(jsonlint())
        .pipe(jsonlint.reporter());

    let javascriptFiles = gulp.src(files.javascript)
        .pipe(jshint())
        .pipe(jshint.reporter(checkstyleFileReporter))
        .pipe(jshint.reporter('default'))
        .pipe(jshint.reporter('fail'));

    return merge(jsonFiles, javascriptFiles);
});

gulp.task('test', function () {
    return gulp.src('test/**/*.spec.js')
        .on('end', function () {
            gutil.log('Done Testing');
        });
});

gulp.task('default', (callback) => {
    runSequence('clean', 'lint', 'test', callback);
});
