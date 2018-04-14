/** 
	fastclass
	EXPORT PLUGIN
	fcr: fastclass Report
	(c) 2018 Jan Oevermann
	jan.oevermann@hs-karlsruhe.de
	License: MIT

*/

define(['controller/store', 'config/params', 'helper/l10n', 'zip'], 
	function(store, config, l, JSZip) {

	var meta = {
		label: l({en: 'fastclass Report', de: 'Report herunterladen'}),
		extension: 'fcr',
		filename: store.repSimilarModules.meta.reportName
	};

	var interface =  {
		register: function () { 
			return meta;
		},

		condition: function () {
			return store.repSimilarModules.data && store.repSimilarModules.data.results.length !== 0;
		},

		execute: function () { 
			var zip = new JSZip();
				
			zip.folder('fastclass')
				.file("report.json", JSON.stringify(store.repSimilarModules));

			var promise = zip.generateAsync({
				type:'blob',
				compression: 'DEFLATE',
				compressionOptions : {
					level: 6 
				}
			});

			return promise;
		}
	};

	return interface;
});