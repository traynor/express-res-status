const gulp = require('gulp');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const eslint = require('gulp-eslint');
//const cache = require('gulp-cached');
const nodemon = require('gulp-nodemon');
const mocha = require('gulp-mocha');
const path = require('path');

const src = 'src/**/*.js';
const test = 'test/**/*.js';
const example = 'example/**/*.js';
const dest = 'lib';

const destTest = `${dest}/test`;

gulp.task('lint', () => {
	return gulp.src([src, test, example])
		.pipe(eslint())
		.pipe(eslint.format());
});

gulp.task('compile', ['lint'], () => {

	return gulp.src([src, test])
		//.pipe(cache('maping'))
		.pipe(sourcemaps.init())
		//.pipe(cache('compiling'))
		.pipe(babel())
		.pipe(sourcemaps.write('.', {includeContent:false, sourceRoot:'../src'}))
		.pipe(gulp.dest(dest));
});


gulp.task('develop', function() {
	return stream = nodemon({
			script: 'example/app', // run build code
			ext: 'js', // file types list to watch
			//ignore: ['ignored.js'],
			// watchlist dirs
			watch: [
				src,
				example,
				test
			],
			// dynamicaly set tasks when onChange triggers
			tasks: function(changedFiles) {
				if (changedFiles) {
					console.log('>>>>changed file: ', changedFiles);
					var tasks = ['test'];
					//changedFiles.forEach(function(file) {
					//	if (path.dirname(file).indexOf('server') > 0) {
					//		tasks.push('compile');
					//	}
					//});
					return tasks;
				} else {
					// if no changes, nodemon crashes on restart
					// returning array seems to work
					return [];
				}
			}
		})
		.on('restart', function() {
			console.log('nodemon restarted');
		})
		.on('start', function() {
			console.log('nodemon started');
		})
		.on('crash', function() {
			console.error('Application has crashed!\n');
			// emitting causes to run task, crashes nodemon
			//stream.emit('restart', 10) // restart the server in 10 seconds
		})
});


gulp.task('test', ['compile'], () => {
	return gulp.src([destTest])
		.pipe(mocha({reporter: 'list'}))
		.once('error', () => {
			process.exit(1);
		})
		.once('end', () => {
			process.exit();
		})
});

// build only
gulp.task('build', ['compile']);

// build and restart server onchange
gulp.task('default', ['develop']);
