/*
	fastclass
	BUILD FILE (r.js)
	(c) 2017 Jan Oevermann
	jan.oevermann@hs-karlsruhe.de
	License: MIT
*/

({
	appDir: "src",
	baseUrl: "./",
	dir: "dist",
	removeCombined: true,
	modules: [
		/* main module */
		{ name: "main" },
		{ name: "utilities/pdftext" },
		{ name: "utilities/validation" },
		{ name: "utilities/duplicates" }
	],
	writeBuildTxt: false,
	uglify2: { 
		mangle: true 
	},
	wrap: true,
	fileExclusionRegExp: /^\.|node_modules/,
	preserveLicenseComments: false
})

/*
	S3 SYNCING
	aws s3 sync . s3://dev.fastclass.de --exclude ".git/*" --exclude "*.css" --dryrun
	aws s3 sync . s3://fastclass.de --exclude ".git/*" --exclude "*" --include "*.css" --no-guess-mime-type --content-type text/css --dryrun
*/