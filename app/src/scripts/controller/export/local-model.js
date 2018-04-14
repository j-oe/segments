/** 
	fastclass
	EXPORT PLUGIN
	local-model: save fastclass Model in Browser
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
			return store.model && Object.keys(store.model).length !== 0;
		},

		execute: function () { 
			return local.storeModel(store.model);
		}
	};

	return interface;
});