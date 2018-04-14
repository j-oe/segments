/** fastclass App Build file 
	(c) Jan Oevermann, 2017
	License: MIT
*/

/* Base dependencies */
var gulp = require('gulp'),
	bower = require('gulp-bower'),
	requirejs = require('requirejs'),
	mainBowerFiles = require('main-bower-files');

/* spectre.css/LESS dependencies */
var less = require('gulp-less'),
	LessPluginAutoPrefix = require('less-plugin-autoprefix');

var r = {
	appDir: 'src',
	baseUrl: 'scripts',
	dir: 'dist',
	removeCombined: true,
	paths: { 
		/* worker */
		'fcWorker': 	'worker/fastclass-worker',
		'rgWorker': 	'worker/range-worker2',
		/* core */
		'core': 		'../../../core/src',
		'modules': 		'../../../core/src/modules',
		'model': 		'../../../core/src/model/model',
		'utilities': 	'../../../core/src/utilities',
		'conf': 		'../../../core/src/configs',
		'configs': 		'../../../core/src/configs',
		/* 3rd party*/
		'd3': 			'../vendor/d3',
		'pie': 			'../vendor/d3pie', 
		'mg': 			'../vendor/metricsgraphics',
		'zip': 			'../vendor/jszip',
		'selectize': 	'../vendor/selectize',
		'jquery': 		'../vendor/jquery',
		'localforage': 	'../vendor/localforage',
		'microplugin': 	'../vendor/microplugin',
		'sifter': 		'../vendor/sifter',
		'almond': 		'../vendor/almond',
		'diff': 		'../vendor/diff',
		'pdfjs-dist/build/pdf': 
			'../vendor/pdf', 
		'pdfjs-dist/build/pdf.worker': 
			'../vendor/pdf.worker',
	},
	modules: [
		/* main modules */
		{ name: 'main' },
		{ name: 'view/plot' },
		{ name: 'selectize' },
		/* fcWorker */
		{
			name: 'fcWorker',
			include: ['almond'],
			insertRequire: ['fcWorker'],
			wrap: true
		},
		/* range Worker */
		{
			name: 'rgWorker',
			include: ['almond'],
			insertRequire: ['rgWorker'],
			wrap: true
		}
	],
	pragmasOnSave: {
        importScripts: true
    },
	optimizeCss: 'standard.keepComments',
	writeBuildTxt: true,
	uglify2: { 
		mangle: true 
	},
	wrap: true,
	fileExclusionRegExp: /^\.|node_modules/,
	preserveLicenseComments: false
};

gulp.task('vendor', ['spectre'], function(){
    gulp.src(mainBowerFiles()).pipe(gulp.dest('./src/vendor'));
});

gulp.task('update', function() {
	return bower({
		cmd: 'update'
	});
});

gulp.task('spectre', function(){
	var autoprefix= new LessPluginAutoPrefix({ browsers: ["last 4 versions"] });

    gulp.src('./bower_components/spectre.css/*.less')
        .pipe(less({
            plugins: [autoprefix]
        }))
        .pipe(gulp.dest('./bower_components/spectre.css/dist'));
});

gulp.task('build', ['vendor'], function(cb){
    requirejs.optimize(r, function (buildResponse) {
	    console.log(buildResponse);
	    cb();
	}, function(err) {
	    console.log(err);
	    cb(err);
	});
});

gulp.task('default', [ 'vendor' ]);