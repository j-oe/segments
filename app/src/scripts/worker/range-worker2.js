/* 
	fastclass
	RANGE FINDER MODULE
	(c) 2018 Jan Oevermann
	jan.oevermann@hs-karlsruhe.de
	License: MIT
*/

//>>excludeStart("importScripts", pragmas.importScripts);
importScripts('../../vendor/require.js');
require.config({
	baseUrl: '../'
});
//>>excludeEnd("importScripts");

require([], function () {

	// post message when ready
	self.postMessage({ready: true});

	var worker = {

		findRanges: function (data) {
			var minima = worker.findMinima(data),
				clusters = worker.clusterMinima(minima),
				ranges = worker.deriveRanges(clusters),
				classes = worker.findClassForRange(ranges, data),
				result = worker.groupRanges(classes);

			self.postMessage(result);
		},

 		findMinima: function (data) {
			var threshold = 20,
				minima = [];

			function hasHigherNeighbor (i, direction) {
				if (data[i + direction].cfd < data[i].cfd) return false;
				if (data[i + direction].cfd > data[i].cfd) return true;

				if (data[i + direction].cfd === data[i].cfd) {
					return hasHigherNeighbor(i + direction, direction);
				}
			}

			// start with second; end with second last
			for (var i = 1; i < data.length - 1; i++) {

				// inject index information
				data[i].idx = i;

				if (data[i].cfd < threshold) {
					if (hasHigherNeighbor(i, -1) && hasHigherNeighbor(i, +1)) {
						minima.push(data[i]);
					}
				}
			}

			return minima;
		},

		clusterMinima: function (minima) {
			var clusteringThreshold = 5,
				clusteredMinima = [];

			function findClusters(start) {
				var cluster = [];
				if (start < minima.length) {
					for (var k = start; k < minima.length - 1; k++) {
						if (minima[k+1].idx > minima[k].idx + clusteringThreshold) {
							cluster.push(minima[k]);
							clusteredMinima.push(cluster);
							return findClusters(k+1);
						} else {
							cluster.push(minima[k]);
						}
					}

				} else return;

			}

			findClusters(0);
			return clusteredMinima;
		},

		deriveRanges: function (clusters) {
			var minimumRange = 5,
				ranges = [];

			for (var j = 0; j < clusters.length; j++) {
				var start = (j === 0) ? 0 : clusters[j-1][clusters[j-1].length-1].idx;
					end = clusters[j][0].idx;
				
				if (end - start >= minimumRange) {
					ranges.push([start, end]);
				}
			}

			return ranges;
		},

		findClassForRange: function (ranges, data) {
			var confidenceThreshold = 50,
				fullRanges = [];

			function median(values) {
			    values.sort( function(a,b) {return a - b;} );
			    var half = Math.floor(values.length/2);
			    if(values.length % 2){
			        return values[half];
			    } else {
			        return (values[half-1] + values[half]) / 2.0;
			    }
			}

			for (var i = 0; i < ranges.length; i++) {
				var rangeDist = {},
					rangeMed = {},
					sortedPurities = [],
					totalObj = 0;
				
				for (var j = ranges[i][0]; j <= ranges[i][1]; j++) {
					if (!rangeDist.hasOwnProperty(data[j].clf)) {
						rangeDist[data[j].clf] = 0;
						rangeMed[data[j].clf] = [];
					}
					rangeDist[data[j].clf] += data[j].cfd;
					rangeMed[data[j].clf].push(data[j].cfd);
					totalObj++;
				}

				// calculate class purity per range		
				for (var classname in rangeDist) {
					sortedPurities.push([classname, Math.floor(rangeDist[classname] / totalObj), median(rangeMed[classname])]);
				}

				sortedPurities.sort(function(a,b) {
					return b[2] - a[2];
				});

				if (sortedPurities[0][2] > confidenceThreshold) {
					fullRanges.push({
						clf: sortedPurities[0][0],
						cfd: sortedPurities[0][2],
						start: data[ranges[i][0]].pos,
						end: data[ranges[i][1]].pos
					});
				}
				
			}

			return fullRanges;
		},

		groupRanges: function (rangeData) {
			var clusteredRanges = [rangeData[0]];

			for (var i = 1; i < rangeData.length; i++) {
				if (clusteredRanges[clusteredRanges.length - 1].clf === rangeData[i].clf) {
					clusteredRanges[clusteredRanges.length - 1].end = rangeData[i].end;
				} else {
					clusteredRanges.push(rangeData[i]);
				}
			}

			return (clusteredRanges);
		}

	};

	self.addEventListener('message', function (msg) {
		var functionName = msg.data[0],
			functionArguments = msg.data.splice(1);
		if (worker.hasOwnProperty(functionName)) {
			worker[functionName].apply(this, functionArguments);
		} else {
			throw new Error('No function with name: ' + functionName);
		}
	});
});