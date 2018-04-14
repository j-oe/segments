/** 
	fastclass
	STORE MODULE
	(c) 2017 Jan Oevermann
	jan.oevermann@hs-karlsruhe.de
	License: MIT

*/

define({

	/*  -----------------------------
		empty fastclass model (FCM)
		-----------------------------  */

	modelTemplate: {
		conf: {},
		meta: {},
		data: {
			matrix: [],
			object: {}
		}
	},

	currentModel: {},

	model: {
		conf: {},
		meta: {},
		data: {
			matrix: [],
			object: {}
		}
	},

	report: {
		meta: {}
	},

	/*  -----------------------------
		application cache (ephemeral)
		-----------------------------  */

	// Handlers
	registeredHandlers: [],

	// XML DOM
	xmlDocuments: [],
	xmlDocumentsCl: [],

	xmlParsingOptions: [],

	// PDF Buffer
	pdfArrayBuffer: {},
	pdfBulkFiles: [],

	// Parsed User Input
	inputData: 	 [],
	inputDataCl: [],
	inputDataRp: [],

	// User data after classification 
	classifiedData: [],
	classifiedFileSources: [],
	classifiedFileCurrentType: undefined,

	// Reports
	repProblematicModules: [],
	repSimilarModules: {
		conf: {},
		meta: {},
		data: {
			results: [],
			mapping: {},
			sources: []
		}
	},
	repAnnotations: [],
});