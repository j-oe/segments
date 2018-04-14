/** 
	fastclass
	EXPORT PLUGIN
	wa-json: WebAnnotation JSON
	(c) 2018 Jan Oevermann
	jan.oevermann@hs-karlsruhe.de
	License: MIT

*/

define(['controller/store', 'config/params'], 
	function(store, config) {

	var meta = {
		label: 'Web Annotation (JSON)',
		extension: 'json',
		filename: 'WebAnnotation',
	};

	var interface =  {
		register: function () { 
			return meta;
		},

		condition: function () {
			return store.classifiedData && store.classifiedData.length !== 0;
		},

		execute: function () { 
			var annoWorker = new Worker(config.getParam('waWorkerURL'));

			var promise = new Promise(
				function(resolve, reject) {

					annoWorker.addEventListener('error', function (err) {
						reject(err);
					});

					annoWorker.addEventListener('message', function (msg) {
						if (msg.data.ready) {
							annoWorker.postMessage(['createAnnotations', 
								store.classifiedData, store.classifiedFileSources,
								store.classifiedFileCurrentType, store.model.meta.modelID]);
						} else {
							annoWorker.terminate();
							resolve(msg.data);
						}				
					});
				}
			);

			return promise;
		}
	};

	return interface;
});