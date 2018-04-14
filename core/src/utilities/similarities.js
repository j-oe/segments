/** 
	fastclass
	SIMILARITIES MODULE
	(c) 2017 Jan Oevermann
	jan.oevermann@hs-karlsruhe.de
	License: MIT

*/

define(['modules/tokens', 'modules/vectors'], 
	function (tkns, vec) {

	this.sim = {

		defaults: {
			similarityCalc: 'cosine',
			similarityThreshold: 90,
			signalsEnabled: false,
			signalWeighting: 2.5,
			tokenWeighting: 1,
			minNrOfTokens: 1,
			minLengthOfTokens: 0,
			nrOfNgrams: 2
		},

		// global dicitonarie of known combinations
		dict: {},

		lookup: function (id1, id2) {
			var d = sim.dict;
			if ((d.hasOwnProperty(id1) && d[id1].hasOwnProperty(id2)) ||
				(d.hasOwnProperty(id2) && d[id2].hasOwnProperty(id1))) {
				// if both IDs have match in dict
				return true;
			} else {
				// if IDs combination does not exist yet, add it but return false
				if (!d.hasOwnProperty(id1)) d[id1] = {};
				// set entry in dict
				d[id1][id2] = true;
				return false;
			}
		},

		read: function (inputTextArr, options) {
			var cfg = Object.assign({}, sim.defaults, options);

			var idObj = {}, // ids x tokens
				vcObj = {}, // ids x vector
				tkObj = {}; // tokens

			// loop over text fragments of input
			for (var i = 0, l = inputTextArr.length; i < l; i++) {

				var textID = inputTextArr[i].xid || 'n' + i,
					textTokens = tkns.ngram(inputTextArr[i].txt, cfg.nrOfNgrams, cfg.minLengthOfTokens),
					signalTokens = [];

				// advanced use: signal token with semantic weighting
				if (cfg.signalsEnabled && inputTextArr[i].hasOwnProperty('sig')) {
					signalTokens = tkns.ngram(inputTextArr[i].sig, cfg.nrOfNgrams, cfg.minLengthOfTokens);
				}

				if (textTokens.length >= cfg.minNrOfTokens) {
					// create or update property for textID of fragment
					idObj[textID] = {};
					tkns.update(idObj[textID], textTokens, signalTokens, cfg.tokenWeighting, cfg.signalWeighting);

					// collect all tokens from inputTextArr
					for (var token in idObj[textID]) {
						if (tkObj.hasOwnProperty(token) === false) {
							tkObj[token] = true;
						}
					}
				}
			}

			var allTokens = Object.keys(tkObj);
			tkObj = undefined;	// GC

			for (var id in idObj) {
				vcObj[id] = vec.createBulk(idObj[id], allTokens);
			}
			idObj = undefined;	// GC
			allTokens = undefined;	// GC
			return vcObj;
		},

		analyze: function (inputTextArr, options) {
			var cfg = Object.assign({}, sim.defaults, options);

			var similarModules = [],
				duplicateModules = [];

			var vcObj = this.read(inputTextArr, options);

			for (var id1 in vcObj) {
				var vec1 = vcObj[id1];

				for (var id2 in vcObj) {
					if (id2 !== id1 && !this.lookup(id1, id2)) {
						var vec2 = vcObj[id2],
							similarity = vec[cfg.similarityCalc](vec1, vec2);

						// normalize JavaScript Floating Point rounding errors
						if (similarity > 1) similarity = 1;

						// filter out object combinations below threshold
						if (similarity >= cfg.similarityThreshold / 100) {
							similarModules.push([similarity, [id1, id2]]);
						}
					}
				}
			}

			return similarModules;
		}
	};

	return this.sim;
});