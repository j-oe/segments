/** 
	fastclass
	MAIN CONFIGURATION
	(c) 2017 Jan Oevermann
	jan.oevermann@hs-karlsruhe.de
	License: MIT

*/

define({

	nrOfNgrams: {
		label: 'Wortgruppen',
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
		label: 'Ähnlichkeitsmaß',
		value: undefined,
		defaultValue: 'cosine',
		writable: true,
		type: 'list',
		values: [{
			text: 'Kosinus',
			value: 'cosine'
		},{
			text: 'L1 / Manhattan',
			value: 'l1'
		},{
			text: 'Testmaß',
			value: 'custom'
		}]
	},

	weightingCalc: {
		label: 'Gewichtung',
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
		label: 'Normalisierte Gewichtung',
		value: undefined,
		defaultValue: true,
		writable: true,
		type: 'boolean'
	},

	minNrOfTokens: {
		label: 'Mindestanzahl Tokens',
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
		label: 'Mindestzeichenlänge Tokens',
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
		label: 'Gewichtungswert Tokens',
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
		label: 'Semantische Gewichtung',
		value: undefined,
		defaultValue: false,
		writable: true,
		type: 'boolean'
	},

	signalWeighting: {
		label: 'Gewichtungswert Semantik',
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
		label: 'Grenzwert für PDF-Bereichsfindung',
		value: undefined,
		defaultValue: 0,
		writable: true,
		type: 'range',
		values: {
			min: 0,
			max: 50,
			step: 1
		}
	},

	confidenceThreshold: {
		label: 'Grenzwert für Konfidenz',
		value: undefined,
		defaultValue: 70,
		writable: true,
		type: 'range',
		values: {
			min: 0,
			max: 100,
			step: 0.5
		}
	},

	similarityThreshold: {
		label: 'Grenzwert für Ähnlichkeit',
		value: undefined,
		defaultValue: 90,
		writable: true,
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
		writable: true,
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
			train: ['inputdata-json', 'fcm', 'local-model'],
			classify: ['wa-json', 'clf-full-json', 'clf-light-json', 'iirds-rdf'],
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
		writable: true,
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
});