/** 
	fastclass
	EXPORT PLUGIN
	raw: Export Raw Source Data
	(c) 2018 Jan Oevermann
	jan.oevermann@hs-karlsruhe.de
	License: MIT

*/

define(['controller/store', 'helper/l10n'], 
	function(store, l) {

	var meta = {
		label: l({en: 'Save source data', de: 'Quelldaten sichern'}),
		extension: 'json',
		filename: 'fastclass_source'
	};

	var interface =  {
		register: function () { 
			return meta;
		},

		condition: function () {
			return store.inputData && store.inputData.length !== 0;
		},

		execute: function () { 
			
			var promise = new Promise(
				function(resolve, reject) {
					resolve(store.inputData);
				}
			);
			
			return promise;
		}
	};

	return interface;
});