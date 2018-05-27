var gulp = require('gulp');
var sass = require('gulp-sass');
var concat = require('gulp-concat');
var imagemin = require('gulp-imagemin');

const paths = {
    styles: {
        dest: 'dist/css/',
        mainPage: 'scss/main.scss',
        restaurant: 'scss/restaurant_info.scss',
        common: 'scss/common.scss'
    },
    images: {
        input: ['img/*/*', 'img/*'],
        output: 'dist/img'
    }
};

function images() {
    return gulp.src(paths.images.input)
        .pipe(imagemin([
            imagemin.jpegtran({progressive: true, arithmetic: false})
        ]))
        .pipe(gulp.dest(paths.images.output))
}

function styles(src) {
    return function () {
        return gulp.src(src)
            .pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
            .pipe(gulp.dest(paths.styles.dest))
        }
}


gulp.task('styles', gulp.parallel([
    styles(paths.styles.mainPage),
    styles(paths.styles.restaurant),
    styles(paths.styles.common)
]));
gulp.task('images', gulp.series(images));
// gulp.task('default', 'styles');
