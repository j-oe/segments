/** 
	fastclass
	EXPORT PLUGIN
	iirds-rdf: iiRDS metadata.rdf
	(c) 2018 Jan Oevermann
	jan.oevermann@hs-karlsruhe.de
	License: MIT

*/

define(['controller/store', 'config/params', 'helper/util'], 
	function(store, config, util) {

	var meta = {
		label: 'iiRDS Metadata (RDF)',
		extension: 'rdf',
		filename: 'fastclass_iirds_metadata',
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
							var rdfXML = createRDFDocument(msg.data);

							var parser = new DOMParser(),
								serializer = new XMLSerializer();
							
							var xmlDoc = parser.parseFromString(rdfXML, "application/xml"),
								xmlStr = serializer.serializeToString(xmlDoc);

							resolve(xmlStr);
						}				
					});
				}
			);

			function createRDFDocument (ranges) {
				var documentTemplate = '<rdf:RDF xmlns:iirds="http://iirds.tekom.de/iirds#" ' +
										 'xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#" ' + 
										 'xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#" ' +
										 'xmlns:dcterms="http://purl.org/dc/terms/">' + 
										  '<iirds:Package rdf:about="' + util.getUUID() + '">' +
											  '<iirds:Version>1.0</iirds:Version>' + 
											  '<iirds:title>Metadata for ' + store.classifiedFileSources[0] +
											   	'.' + store.classifiedFileCurrentType + 
											  	' based on model ' + store.model.meta.modelName + 
											  '</iirds:title>' + 
											  '<iirds:identifier>' + store.model.meta.modelID + '</iirds:identifier>' + 
											  '<iirds:has-author>' + store.model.meta.modelCreator +  '</iirds:has-author>' + 
										  '</iirds:Package>';

				for (var i = 0; i < ranges.length; i++) {
					documentTemplate += createInformationUnit(ranges[i]);
				}

				documentTemplate += '</rdf:RDF>';

				return documentTemplate;
			}

			function createInformationUnit (range) {
				var unitTemplate = '<iirds:Fragment rdf:about="' + util.getUUID() + '">' +
									  '<iirds:has-subject rdf:resource="http://iirds.tekom.de/iirds#' + range.clf + '"/>' +
									  '<iirds:has-rendition>' +
									    '<iirds:Rendition>' +
									      '<iirds:format>application/' + store.classifiedFileCurrentType + '</iirds:format>' +
									      '<iirds:source>' + store.classifiedFileSources[0] + '.' + 
									      		store.classifiedFileCurrentType + '</iirds:source>' +
									      '<iirds:has-selector>' + 
									          '<iirds:RangeSelector>' + 
									              '<iirds:has-start-selector>' +
									                  '<iirds:FragmentSelector>' +
									                      '<dcterms:conformsTo rdf:resource="http://tools.ietf.org/rfc/rfc3778"/>' + 
									                      '<rdf:value>page=' + range.start + '</rdf:value>' +
									                  '</iirds:FragmentSelector>' + 
									              '</iirds:has-start-selector>' +
									              '<iirds:has-end-selector>' + 
									                  '<iirds:FragmentSelector>' + 
									                      '<dcterms:conformsTo rdf:resource="http://tools.ietf.org/rfc/rfc3778"/>' + 
									                      '<rdf:value>page=' + range.end + '</rdf:value>' +
									                  '</iirds:FragmentSelector>' +
									              '</iirds:has-end-selector>' +
									          '</iirds:RangeSelector>' +
									      '</iirds:has-selector>' +
									    '</iirds:Rendition>' +
									  '</iirds:has-rendition>' +  
									'</iirds:Fragment>';

				return unitTemplate;
			}

			return promise;
		}
	};

	return interface;
});