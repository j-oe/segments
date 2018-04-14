/** 
	fastclass
	EXPORT PLUGIN
	rg-json: Range finding JSON export
	(c) 2018 Jan Oevermann
	jan.oevermann@hs-karlsruhe.de
	License: MIT

*/

define(['controller/store', 'config/params'], 
	function(store, config) {

	var meta = {
		label: 'Ranges (JSON)',
		extension: 'json',
		filename: 'RangesTest',
	};

	var interface =  {
		register: function () { 
			return meta;
		},

		condition: function () {
			return store.classifiedData && store.classifiedData.length !== 0;
		},

		execute: function () { 
			var rangeWorker = new Worker(config.getParam('rgWorkerURL'));

			var promise = new Promise(
				function(resolve, reject) {

					rangeWorker.addEventListener('error', function (err) {
						reject(err);
					});

					rangeWorker.addEventListener('message', function (msg) {
						if (msg.data.ready) {
							rangeWorker.postMessage(['findRanges', store.classifiedData]);
						} else {
							rangeWorker.terminate();
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