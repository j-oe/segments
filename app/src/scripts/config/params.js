/** 
	fastclass
	MAIN CONFIGURATION
	(c) 2017 Jan Oevermann
	jan.oevermann@hs-karlsruhe.de
	License: MIT

*/

define(['controller/local', 'helper/l10n'], function(local, l) {
	/* config singleton */

	var params = {

		nrOfNgrams: {
			label: 'Word groups',
			value: undefined,
			defaultValue: 2,
			writable: true,
			type: 'list',
			values: [{
				text: 'n = {1,2,3}',
				value: -3
			},{
				text: 'n = {1,2}',
				value: -2
			},{
				text: 'n = 1',
				value: 1
			},{
				text: 'n = 2',
				value: 2
			},{
				text: 'n = 3',
				value: 3
			},{
				text: 'n = 4',
				value: 4
			}]
		},

		similarityCalc: {
			label: 'Similarity measure',
			value: undefined,
			defaultValue: 'cosine',
			writable: true,
			type: 'list',
			values: [{
				text: 'Cosine',
				value: 'cosine'
			},{
				text: 'L1 / Manhattan',
				value: 'l1'
			},{
				text: 'Test measure',
				value: 'custom'
			}]
		},

		weightingCalc: {
			label: 'Weighting',
			value: undefined,
			defaultValue: 'tf-icf-cf',
			writable: true,
			type: 'list',
			values: [{
				text: 'TF-ICF-CF',
				value: 'tf-icf-cf'
			},{
				text: 'TF-IDF-CF',
				value: 'tf-idf-cf'
			},{
				text: 'TF-IDF',
				value: 'tf-idf'
			},{
				text: 'TF-IDF (smooth)',
				value: 'tf-idf-s'
			}]
		},

		normalizeWeights: {
			label: 'Normalize weighting',
			value: undefined,
			defaultValue: true,
			writable: true,
			type: 'boolean'
		},

		minNrOfTokens: {
			label: 'Minimum nr. of tokens',
			value: undefined,
			defaultValue: 1,
			writable: true,
			type: 'range',
			values: {
				min: 0,
				max: 5,
				step: 1
			}
		},

		minLengthOfTokens: {
			label: 'Minimum length of token',
			value: undefined,
			defaultValue: 0,
			writable: true,
			type: 'range',
			values: {
				min: 0,
				max: 10,
				step: 1
			}
		},

		tokenWeighting: {
			label: 'Token weighting value',
			value: undefined,
			defaultValue: 1,
			writable: false,
			type: 'range',
			values: {
				min: 1,
				max: 100,
				step: 0.5
			}
		},

		signalsEnabled: {
			label: 'Semantic weighting',
			value: undefined,
			defaultValue: false,
			writable: true,
			type: 'boolean'
		},

		signalWeighting: {
			label: 'Semantic weighting value',
			value: undefined,
			defaultValue: 10,
			writable: true,
			type: 'range',
			values: {
				min: 1,
				max: 100,
				step: 0.5
			}
		},

		rangeThreshold: {
			label: 'PDF range finding threshold',
			value: undefined,
			defaultValue: 0,
			writable: false,
			type: 'range',
			values: {
				min: 0,
				max: 50,
				step: 1
			}
		},

		confidenceThreshold: {
			label: 'Confidence Threshold',
			value: undefined,
			defaultValue: 70,
			writable: false,
			type: 'range',
			values: {
				min: 0,
				max: 100,
				step: 0.5
			}
		},

		similarityThreshold: {
			label: 'Similarity Threshold',
			value: undefined,
			defaultValue: 90,
			writable: false,
			type: 'range',
			values: {
				min: 0,
				max: 100,
				step: 0.5
			}
		},

		verboseReporting: {
			label: 'Ausführliche Berichte',
			value: undefined,
			defaultValue: false,
			writable: false,
			type: 'boolean'
		},

		indicators: {
			label: 'Indikatoren',
			value: undefined,
			defaultValue: true,
			writable: false,
			type: 'boolean'
		},

		appIRI: {
			label: "Identifier der Anwendung",
			value: 'http://dev.fastclass.de',
			writable: false,
			type: 'string'
		},

		appName: {
			label: "Name der Anwendung",
			value: 'fastclass DevPreview',
			writable: false,
			type: 'string'
		},

		enabledImports: {
			label: "Import-Formate",
			value: {
				train: ['fcm', 'xml', 'json'],
				classify: ['xml', 'json', 'pdf'],
				similarity: ['xml', 'json', 'zip']
			},
			writable: false,
			type: 'object'
		},

		enabledExports: {
			label: "Export-Formate",
			value: {
				train: ['inputdata-json', 'local-model'],
				classify: ['range-json', 'clf-full-json', 'iirds-rdf'],
				report: ['sim-json', 'sim-csv', 'fcr', 'local-report'],
				config: ['fc-config'],
				quality: ['qa-json']
			},
			writable: false,
			type: 'object'
		},

		configurationDownloadable: {
			label: 'Konfiguration downloadbar',
			value: undefined,
			defaultValue: true,
			writable: false,
			type: 'boolean'
		},

		fcWorkerURL: {
			value: 'scripts/worker/fastclass-worker.js',
			writable: false,
			type: 'string'
		},

		waWorkerURL: {
			value: 'scripts/worker/annotation-worker.js',
			writable: false,
			type: 'string'
		},

		rgWorkerURL: {
			value: 'scripts/worker/range-worker2.js',
			writable: false,
			type: 'string'
		},

		smWorkerURL: {
			value: 'scripts/worker/similarities-worker.js',
			writable: false,
			type: 'string'
		},

		dfWorkerURL: {
			value: 'scripts/worker/diffing-worker.js',
			writable: false,
			type: 'string'
		},

		demoFiles: {
			value: {
				fcm: {
					de: '../src/res/data/democ.fcm', 
					en: '../res/data/demo.en.fcm'
				},
				pdf: {
					de: '../src/res/data/pdf.json', 
					en: '../res/data/pdf.en.json'
				}
			},
			type: 'object',
			writable: false
		},

		indicatorValues: {
			value: {
				nrOfObjects: {
					type: 'scale',
					values: [100,1000]
				},
				nrOfClasses: {
					type: 'range',
					values: [2,20,40]
				},
				sizeOfObjects: {
					type: 'range',
					values: [50,500,1000]
				},
				timeElapsed: {
					type: 'scale',
					values: [100,0]
				}
			},
			type: 'object',
			writable: false
		}
		
	};

	var methods =  {
		setParam: function (key, value, internal) {
			if (params.hasOwnProperty(key)) {
				if (params[key].writable) {
					params[key].value = value;
					if (!internal) {
						local.saveSettings(methods.getConfig());
					}
				}
			} else {
				console.log('tried to set unknown param: ', key);
			}
		},

		getParam: function (key) { 
			if (params.hasOwnProperty(key)) {
				if (params[key].value === undefined) {
					return params[key].defaultValue;
				} else {
					return params[key].value;
				}
			} else {
				console.log('tried to get unknown param: ', key);
			}
		},

		getCompleteConfig: function (key) { 
			return params;
		},

		getWritableConfig: function (key) { 
			var writableConfigObj = {};

			Object.keys(params).forEach(function (key) {
				if (params[key].writable) {
					writableConfigObj[key] = params[key];
				}
			});

			return writableConfigObj;
		},

		getConfig: function () { 
			var configObj = {};

			Object.keys(params).forEach(function (key) {
				configObj[key] = methods.getParam(key);
			});

			return configObj;
		},

		loadConfig: function (config) {
			Object.keys(config).forEach(function (key) {
				methods.setParam(key, config[key], true);
			});
		},

		resetConfig: function () {
			Object.keys(params).forEach(function (key) {
				methods.setParam(key, params[key].defaultValue, true);
			});
		}
	};

	return methods;
});