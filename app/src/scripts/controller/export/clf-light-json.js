/** 
	fastclass
	EXPORT PLUGIN
	compact-json: Export result data without text content
	(c) 2018 Jan Oevermann
	jan.oevermann@hs-karlsruhe.de
	License: MIT

*/

define(['controller/store', 'helper/l10n'], 
	function(store, l) {

	var meta = {
		label: l({en: 'Overview (JSON)', de: 'Übersicht (JSON)'}),
		extension: 'json',
		filename: 'fastclass_source'
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
					var exportData = [].concat(store.classifiedData);
				
					exportData.forEach(function(i){ delete i.txt; });

					resolve(exportData);
				}
			);
			
			return promise;
		}
	};

	return interface;
});