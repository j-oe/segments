/** 
	fastclass
	EXPORT PLUGIN
	local-report: save fastclass Report in Browser
	(c) 2018 Jan Oevermann
	jan.oevermann@hs-karlsruhe.de
	License: MIT

*/

define(['controller/store', 'controller/local', 'helper/l10n'], 
	function(store, local, l) {

	var meta = {
		label: l({en: 'Save in Browser', de: 'In Browser speichern'})
	};

	var interface =  {
		register: function () { 
			return meta;
		},

		condition: function () {
			return store.repSimilarModules && Object.keys(store.repSimilarModules).length !== 0;
		},

		execute: function () { 
			return local.storeReport(store.repSimilarModules);
		}
	};

	return interface;
});