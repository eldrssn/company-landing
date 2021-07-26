const { src, dest, watch, parallel, series } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const autoprefixer = require('gulp-autoprefixer');
const pug = require('gulp-pug');
const webpack = require('webpack'); 
const webpackStream = require('webpack-stream');
const webpackConfig = require('./webpack.config.js');
const sourcemaps = require('gulp-sourcemaps');
const del = require('del');
const imagemin = require('gulp-imagemin')

// автоматическое обновление страницы
function browsersync() {
	browserSync.init({
		server: {
			baseDir: "./app/"
		}
	})
}

//очищение папки dist
function clearDist() {
	return del('./dist');
}

// работа с html-шаблонами
function templates() {
	return src('./app/templates/*.pug')
        .pipe(pug({ pretty: true })) 
        .pipe(dest('./app'))
}

// scss -> css и сжатие css
function styles() {
    return src('./app/scss/style.scss')
		.pipe(sourcemaps.init())
		.pipe(sass({outputStyle: 'compressed'}).on('error', sass.logError))
		.pipe(concat('style.min.css'))
		.pipe(autoprefixer({
			overrideBrowserslist: ['last 8 version'], 
			grid: true, 
			browsers: [
				'Android >= 4',
				'Chrome >= 20',
				'Firefox >= 24',
				'Explorer >= 11',
				'iOS >= 6',
				'Opera >= 12',
				'Safari >= 6',
			]
		}))
		.pipe(cleanCSS({
			level: 2
		}))
    .pipe(sourcemaps.write())
		.pipe(dest('./app/css'))
		.pipe(browserSync.stream())
}

// работа с модулями js и их сжатие
function scripts() {
	return src('./app/js/modules/main.js')
		.pipe(webpackStream(webpackConfig), webpack)
		.pipe(dest('./app/js'))
		.pipe(browserSync.stream())
}

// сжатие изображений 
function images() {
	return src('./app/images/**/*.*')
	.pipe(imagemin([
		imagemin.gifsicle({interlaced: true}),
		imagemin.mozjpeg({quality: 75, progressive: true}),
		imagemin.optipng({optimizationLevel: 5}),
		imagemin.svgo({
			plugins: [
				{removeViewBox: true},
				{cleanupIDs: false}
			]
		})
	]
	))
	.pipe(dest('./dist/images'))
}

//импорт готовых файлов в dist
function build() {
	return src([
		'./app/css/*.min.css',
		'./app/fonts/**.*',
		'./app/js/main.bundle.js',
		'./app/index.html'
	], {base: './app'})
		.pipe(dest('./dist'))
}

// слежка за файлами и их обновление
function watching() {
	watch(['./app/scss/**/*.scss'], styles);
	watch(['./app/js/modules/**/*.js'], scripts);
	watch(['./app/templates/*.pug'], templates);
	watch(['./app/*.html']).on('change', browserSync.reload);
}

exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.templates = templates;
exports.clearDist = clearDist;
exports.images = images;

exports.build = series( 
  clearDist, 
  parallel(images, styles, scripts, templates),
  build
  );

exports.default = parallel(styles, templates, scripts, browsersync, watching);