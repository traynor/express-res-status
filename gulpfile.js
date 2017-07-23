const gulp = require('gulp');
const babel = require('gulp-babel');
const sourcemaps = require('gulp-sourcemaps');
const eslint = require('gulp-eslint');
// skip, need research some buggy behaviour
//const cache = require('gulp-cached');
const nodemon = require('gulp-nodemon');
const mocha = require('gulp-mocha');
// path is needed for `develop`
//const path = require('path');

const src = 'src/**/*.js';
const example = 'example/**/*.js';
const dest = 'lib';

gulp.task('lint', () => {
	return gulp.src([src, example])
		.pipe(eslint())
		.pipe(eslint.format());
});

gulp.task('compile', ['lint'], () => {

	return gulp.src([src])
		// seems there were some bugs, so skip
		//.pipe(cache('maping'))
		.pipe(sourcemaps.init())
		//.pipe(cache('compiling'))
		.pipe(babel())
		.pipe(sourcemaps.write('.', {
			includeContent: false,
			sourceRoot: '../src'
		}))
		.pipe(gulp.dest(dest));
});


gulp.task('develop', function() {
	const stream = nodemon({
			script: 'example/app', // run build code
			ext: 'js', // file types list to watch
			//ignore: ['ignored.js'],
			// watchlist dirs
			watch: [
				src,
				example
			],
			// dynamicaly set tasks when onChange triggers
			tasks: function(changedFiles) {
				if (changedFiles) {
					/* eslint-disable no-console */
					console.log('>>>>changed file: ', changedFiles);
					/* eslint-enable no-console */
					// leave setup for multiple tasks
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
			/* eslint-disable no-console */
			console.log('nodemon restarted');
			/* eslint-enable no-console */
		})
		.on('start', function() {
			/* eslint-disable no-console */
			console.log('nodemon started');
			/* eslint-enable no-console */
		})
		.on('crash', function() {
			/* eslint-disable no-console */
			console.error('nodemon crashed!\n');
			/* eslint-enable no-console */
			// emitting causes to run task, crashes nodemon
			//stream.emit('restart', 10) // restart the server in 10 seconds
		});
		return stream;
});


gulp.task('test', ['compile'], () => {
	return gulp.src([dest])
		.pipe(mocha({
			reporter: 'list'
		}))
		.once('error', () => {
			process.exit(1);
		})
		.once('end', () => {
			process.exit();
		});
});

// build only
gulp.task('build', ['compile']);

// build and restart server onchange
gulp.task('default', ['develop']);
