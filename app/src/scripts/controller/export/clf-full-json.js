/** 
	fastclass
	EXPORT PLUGIN
	result: Export native JSON result data
	(c) 2018 Jan Oevermann
	jan.oevermann@hs-karlsruhe.de
	License: MIT

*/

define(['controller/store', 'helper/l10n'], 
	function(store, l) {

	var meta = {
		label: l({en: 'Classifications (JSON)', de: 'Klassifikationen (JSON)'}),
		extension: 'json',
		filename: 'fastclass_classification'
	};

	var interface =  {
		register: function () { 
			return meta;
		},

		condition: function () {
			return store.classifiedData && store.classifiedData.length !== 0;
		},

		execute: function () { 
			
			var promise = new Promise(
				function(resolve, reject) {
					resolve(store.classifiedData);
				}
			);
			
			return promise;
		}
	};

	return interface;
});