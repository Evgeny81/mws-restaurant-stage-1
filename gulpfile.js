var gulp = require('gulp');
var sass = require('gulp-sass');
var imagemin = require('gulp-imagemin');
var webserver = require('gulp-webserver');

const paths = {
    styles: {
        dest: 'dist/css/',
        mainPage: 'scss/main.scss',
        restaurant: 'scss/restaurant_info.scss'
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

function server() {
    return gulp.src('./')
        .pipe(webserver({
            livereload: true,
            directoryListing: true,
            open: 'index.html',
            fallback: 'index.html'
        }));
}
gulp.task('webserver', gulp.series(server));


gulp.task('styles', gulp.parallel([
    styles(paths.styles.mainPage),
    styles(paths.styles.restaurant)
]));
gulp.task('images', gulp.series(images));
gulp.task('default', gulp.parallel(['styles', 'images']));
