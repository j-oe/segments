/** 
	fastclass
	EXPORT PLUGIN
	sim-json: Export native JSON similarity data
	(c) 2018 Jan Oevermann
	jan.oevermann@hs-karlsruhe.de
	License: MIT

*/

define(['controller/store', 'helper/l10n'], 
	function(store, l) {

	var meta = {
		label: l({en: 'Similarities (CDV)', de: 'Ähnlichkeiten (CSV)'}),
		extension: 'csv',
		filename: 'fastclass_similarity'
	};

	var interface =  {
		register: function () { 
			return meta;
		},

		condition: function () {
			return store.repSimilarModules.data.results && store.repSimilarModules.data.results.length !== 0;
		},

		execute: function () { 
			
			var promise = new Promise(
				function(resolve, reject) {					
					var reportDownload = 'Similarity;Object 1;Object 2\r\n';
				
					store.repSimilarModules.data.results.forEach(function(i){ 
						reportDownload += i[0] + ';' + i[1][0] + ';'  + i[1][1] + '\r\n'; 
					});

					resolve(reportDownload);
				}
			);
			
			return promise;
		}
	};

	return interface;
});