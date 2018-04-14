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
		label: l({en: 'Similarities (JSON)', de: 'Ähnlichkeiten (JSON)'}),
		extension: 'json',
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
					resolve(store.repSimilarModules.data.results);
				}
			);
			
			return promise;
		}
	};

	return interface;
});