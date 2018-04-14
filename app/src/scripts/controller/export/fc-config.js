/** 
	fastclass
	EXPORT PLUGIN
	config: Export fasctlass Configuration
	(c) 2018 Jan Oevermann
	jan.oevermann@hs-karlsruhe.de
	License: MIT

*/

define(['config/params', 'helper/l10n'], 
	function(config, l) {

	var meta = {
		label: l({en: 'Export configuration', de: 'Konfiguration herunterladen'}),
		extension: 'json',
		filename: 'fastclass_config'
	};

	var interface =  {
		register: function () { 
			return meta;
		},

		condition: function () {
			return config.getParam('configurationDownloadable');
		},

		execute: function () { 
			
			var promise = new Promise(
				function(resolve, reject) {
					resolve(config.getConfig());
				}
			);
			
			return promise;
		}
	};

	return interface;
});