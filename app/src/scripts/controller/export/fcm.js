/** 
	fastclass
	EXPORT PLUGIN
	fcm: fastclass Model
	(c) 2018 Jan Oevermann
	jan.oevermann@hs-karlsruhe.de
	License: MIT

*/

define(['controller/store', 'config/params', 'helper/l10n', 'zip'], 
	function(store, config, l) {

	var meta = {
		label: l({en: 'fastclass Model', de: 'Modell herunterladen'}),
		extension: 'fcm',
		filename: store.model.meta.modelName
	};

	var interface =  {
		register: function () { 
			return meta;
		},

		condition: function () {
			return store.model.data.matrix && Object.keys(store.model.data.matrix).length !== 0;
		},

		execute: function () { 
			var zip = new JSZip();

			store.model.conf = config.getConfig(); // TODO: Outsource
			
			zip.folder('fastclass')
				.file("model.json", JSON.stringify(store.model));

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