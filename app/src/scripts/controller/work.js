/** 
	fastclass
	WORK MODULE (worker handling)
	(c) 2016 Jan Oevermann
	jan.oevermann@hs-karlsruhe.de
	License: MIT

*/


define(['config/params', 'view/ui', 'view/bind', 'controller/store', 'helper/util', 'helper/l10n'], 
	function (config, ui, bind, store, util, l) {

	var work = {

		processPDF: function (pdfObject, fileName) {
			var pdfWorker = new Worker(config.getParam('fcWorkerURL'));

			pdfWorker.addEventListener('error', function (err) {
				ui.showModal(l('work_proc_pdf'));
			});

			pdfWorker.addEventListener('message', function (msg) {
				if (msg.data.ready) {
					pdfWorker.postMessage(['chunkPDF', 
						pdfObject, store.model.meta.averageWordCount]);
				} else {
					store.inputDataCl = msg.data;

					// remove PDF array buffer after processing
					store.pdfArrayBuffer[fileName] = null;

					ui.loading('import_pdf_cl');

					pdfWorker.terminate();
				}				
			});
		},

		processBulkPDF: function (pdfObject, fileName) {

			var pdfBulkWorker = new Worker(config.getParam('fcWorkerURL'));

			pdfBulkWorker.addEventListener('error', function (err) {
				ui.showModal(l('work_proc_pdf'));
			});

			pdfBulkWorker.addEventListener('message', function (msg) {
				if (msg.data.ready) {
					pdfBulkWorker.postMessage(['processPDF', pdfObject]);
				} else {
					var textContent = msg.data;

					pdfBulkWorker.terminate();

					var fcTxtObject = {
						xid: fileName,
						txt: textContent,
						dsc: fileName
					};

					// remove PDF array buffer after processing
					store.pdfArrayBuffer[fileName] = null;

					store.inputDataRp.push(fcTxtObject);

					if (store.inputDataRp.length === store.pdfBulkFiles.length) {
						ui.hide('import_rp');
						ui.show(['import_pdf_rp', 'threshold_autoadjust']);

						// decrease threshold for this task
						config.setParam('similarityThreshold', 0);
					}
				}				
			});
		},

		getSimilarityReport: function (source) {
			if (store.inputDataRp && store.inputDataRp.length !== 0) {
				var simWorker = new Worker(config.getParam('smWorkerURL'));

				simWorker.addEventListener('error', function (err) {
					ui.showModal(l('work_proc_dupes'));
				});

				simWorker.addEventListener('message', function (msg) {
					if (msg.data.ready) {
						simWorker.postMessage(['findSimilar', store.inputDataRp, config.getConfig()]);
					} else {

						store.repSimilarModules.data.sources = store.inputDataRp;
						store.repSimilarModules.meta.reportCreated = util.getDateString();
						store.repSimilarModules.meta.timeElapsed = msg.data[1];
						store.repSimilarModules.conf = config.getConfig();
						store.repSimilarModules.data.results = msg.data[0];
						store.repSimilarModules.data.mapping = msg.data[2];

						if (source === 'xml') {
							store.repSimilarModules.meta.weightedElements = store.xmlParsingSettings[2];
						}

						if (msg.data[0].length > 0) {
							bind.printReportAnalysis(store.repSimilarModules);	
						} else {
							ui.showModal('Überprüfen Sie den eingestellten Grenzwert', 'Keine Ergebnisse');
						}
						

						ui.loading('import_' + source + '_rp');

						work.registerExportHandlers('report');

						simWorker.terminate();
					}				
				});
			} else {
				ui.showModal(l('work_no_userdata'));
				ui.loading('import_' + source + '_rp');
			}
		},

		trainModel: function (source) {
			if (store.inputData && store.inputData.length !== 0) {
				var inputWorker = new Worker(config.getParam('fcWorkerURL')),
					startTime = util.getTime();

				inputWorker.addEventListener('error', function (err) {
					ui.showModal(l('work_proc_userdata'));
				});

				inputWorker.addEventListener('message', function (msg) {
					if (msg.data.ready) {
						inputWorker.postMessage(['trainFromScratch', 
							store.inputData, store.model.data.object]);
					} else {
						processResults(msg.data, inputWorker);
					}
				});				
			} else {
				ui.showModal(l('work_no_userdata'));
				ui.loading('import_' + source);
			}

			function processResults (data, worker) {
				store.model.data.matrix = data[0];
				store.model.data.object = data[1];
				
				store.model.meta.analyzedFiles	   = store.model.meta.analyzedFiles + 1 || 1;
				store.model.meta.analyzedObjects   = data[1]['@cnt'];
				store.model.meta.analyzedClasses   = data[1]['@cls'];
				store.model.meta.averageWordCount  = data[1]['@avg'];
				store.model.meta.trainingDuration  = util.getTime() - startTime;
				store.model.meta.classDistribution = util.getClassDistribution(store.model.data.object);

				ui.loading('import_' + source);
				bind.printTrainingAnalysis(store.model.meta);
				ui.unlockPanels();

				work.registerExportHandlers('train');

				worker.terminate();
			}		
		},

		classifyUserInput: function (source) {
			if (store.inputDataCl && store.inputDataCl.length !== 0) {
				var clfWorker = new Worker(config.getParam('fcWorkerURL'));

				clfWorker.addEventListener('error', function (err) {
					ui.showModal(l('work_class_userdata'));
				});

				clfWorker.addEventListener('message', function (msg) {
					if (msg.data.ready) {
						clfWorker.postMessage(['classifyMultiple', 
							store.inputDataCl, store.model.data.matrix]);
					} else if (msg.data[0] === 'result') {
						store.classifiedData = msg.data[1][0];
						
						var overThreshold = 0,
							timingInformation = msg.data[1][1];

						store.classifiedData.forEach(function(i){
							if (i.cfd >= config.getParam('confidenceThreshold')) overThreshold++;
						});

						bind.printClassificationAnalysis({
							cnt: store.classifiedData.length,
							tme: timingInformation,
							cfd: overThreshold,
							dis: util.getClassDistribution(store.classifiedData),
							arr: store.classifiedData
						}, source);

						ui.hide('status_cl');
						ui.loading('import_' + source + '_cl');

						work.registerExportHandlers('classify');

						clfWorker.terminate();
					} else if (msg.data[0] === 'status') {
						var currentObjectIndex = msg.data[1][0],
							totalNrOfObjects = msg.data[1][1];

						bind.setClassificationProgress(util.percent(currentObjectIndex, totalNrOfObjects));				
					}
					
				});

				
			} else {
				ui.showModal(l('work_no_classdata'));
				ui.loading('import_' + source + '_cl');
			}				
		},

		getQualityScores: function (options) {
			var getSVL = options[0],
				getCVL = options[1];
			
			// if already calculated, then get from metadata
			if (store.model.meta.qsQuality && store.model.meta.qsForecast) {
				bind.prepareQualityAnalysis(options);
				bind.printQualityScore('svl', store.model.meta.qsQuality);
				bind.printQualityScore('cvl', store.model.meta.qsForecast);
				ui.loading('qs', false);

			// if not in metadata, calculate scores
			} else {
				if (store.model.data.matrix && store.model.data.matrix.length !== 0) {

					bind.prepareQualityAnalysis(options);

					// SVL :: SelfVaLidation (quality score)
					if (getSVL) {
						var svlWorker = new Worker(config.getParam('fcWorkerURL'));

						svlWorker.addEventListener('error', function (err) {
							ui.showModal(l('quality_score_svl'));
						});

						svlWorker.addEventListener('message', function (msg) {
							if (msg.data.ready) {
								svlWorker.postMessage(['selfValidate', 
									store.inputData, store.model.data.matrix]);
							} else {
								var svlScore = msg.data[0];

								if (msg && svlScore > 0) {
									store.model.meta.qsQuality  = msg.data[0];
									store.repProblematicModules = msg.data[1];

									bind.printQualityScore('svl', svlScore);
									ui.show('downloadQSreport');
								} else {
									ui.showModal(l('quality_score_svl'));
								}

								svlWorker.terminate();
							}
						});
					}

					// CVL :: CrosssVaLidation (quality score)
					if (getCVL) {
						var cvlWorker = new Worker(config.getParam('fcWorkerURL'));

						cvlWorker.addEventListener('error', function (err) {
							ui.showModal(l('quality_score_cvl'));
						});

						cvlWorker.addEventListener('message', function (msg) {
							if (msg.data.ready) {
								cvlWorker.postMessage(['crossValidate', 
									store.inputData]);
							} else {
								var cvlScore = msg.data[0];

								if (msg && cvlScore > 0) {
									store.model.meta.qsForecast     = msg.data[0];
									store.model.meta.qsCvlScores    = msg.data[1];
									store.model.meta.qsCvlDeviation = msg.data[2];

									bind.printQualityScore('cvl', cvlScore);
								} else {
									ui.showModal(l('quality_score_cvl'));
								}

								cvlWorker.terminate();
							}
						});
					}
				} else {
					ui.showModal(l('routing_model'));
					ui.loading('qs', false);
				}
			}
		},

		classifyTextInput: function (textInput) {
			if (store.model.data.matrix && Object.keys(store.model.data.matrix).length !== 0) {
				if (textInput && textInput !== '') {
					if (textInput.split(/\s+/).length >= 3) {
						var textWorker = new Worker(config.getParam('fcWorkerURL'));

						textWorker.addEventListener('error', function (err) {
							ui.showModal(l('authoring_error'));
						});

						textWorker.addEventListener('message', function (msg) {
							if (msg.data.ready) {
								textWorker.postMessage(['classifyText', 
									textInput, store.model.data.matrix]);
							} else {
								ui.loading('classify_textinput');
								bind.printClassificationAnalysisText(msg.data);
								
								textWorker.terminate();
							}
						});
					} else {
						ui.showModal(l('authoring_text_min'));
						ui.loading('classify_textinput');
					}
				} else {
					ui.showModal(l('authoring_no_text'));
					ui.loading('classify_textinput');
				}
			} else {
				ui.showModal(l('routing_model'));
				ui.loading('classify_textinput');
			} 
		},

		/*exportConfig: function () {
			if (config.getConfig()) {
				util.downloadFile(config.getConfig(), 'fastclass_config' + Date.now() + '.json');
				ui.loading('export_set');
			}
		},

		exportSource: function () {
			if (store.inputData) {
				util.downloadFile(store.inputData, 'fastclass_source' + Date.now() + '.json');
				ui.loading('save_source');
			}
		},

		exportMemory: function () {
			if (store.model.data.matrix && Object.keys(store.model.data.matrix).length !== 0) {
				// build ZIP-based FCM format
				require(['zip'], function (JSZip) {
					var zip = new JSZip();

					store.model.conf = config.getConfig();
				
					zip.folder('fastclass')
						.file("model.json", JSON.stringify(store.model));

					zip.generateAsync({
						type:'blob',
						compression: 'DEFLATE',
						compressionOptions : {
							// level between 1 (best speed) and 9 (best compression)
							level: 6 
						}
					}).then(function(content) {
					    util.downloadFile(content, 
					    	util.createFileName(store.model.meta.modelName) + '.fcm');
					    ui.loading('save_fcm');
					});
				});
			} else {
				ui.showModal(l('work_no_model'));
				ui.loading('save_fcm');
			}
		},

		exportResults: function (stripText) {
			if (store.classifiedData && store.classifiedData.length !== 0) {
				var resultDownload = [].concat(store.classifiedData);
				
				if (stripText) {
					resultDownload.forEach(function(i){ delete i.txt; });
				}

				util.downloadFile(resultDownload, 'fastclass_' + // TODO 
					Date.now() + '.json');
				ui.loading('export_results');
			} else {
				ui.showModal(l('work_no_classdata'));
				ui.loading('export_results');
			}
		},

		exportAnnotations: function () {
			var annoWorker = new Worker(config.getParam('waWorkerURL'));

			annoWorker.addEventListener('error', function (err) {
				ui.showModal(l('work_proc_annos'));
			});

			annoWorker.addEventListener('message', function (msg) {
				if (msg.data.ready) {
					annoWorker.postMessage(['createAnnotations', 
						store.classifiedData, store.classifiedFileSources,
						store.classifiedFileCurrentType, store.model.meta.modelID]);
				} else {
					store.repAnnotations = msg.data;

					util.downloadFile(store.repAnnotations, 
						'fastclass_anno_' + Date.now() + '.json');
					ui.loading('export_wa');

					annoWorker.terminate();
				}				
			});
		},

		exportReport: function () {
			if (store.repProblematicModules && store.repProblematicModules.length !== 0) {
				var reportDownload = [].concat(store.repProblematicModules);
				reportDownload.forEach(function(i){ delete i.txt; });

				util.downloadFile(reportDownload, 'fastclass_problematicModules_' + 
					Date.now() + '.json');
			} else {
				ui.showModal(l('work_no_classdata'));
			}
			ui.loading('export_report', false);
		},

		exportSim: function () {
			if (store.repSimilarModules.data.results && store.repSimilarModules.data.results.length !== 0) {
				var reportDownload = [].concat(store.repSimilarModules.data.results);
				
				util.downloadFile(reportDownload, 'fastclass_similarModules_' + 
					Date.now() + '.json');
			} else {
				ui.showModal(l('work_no_classdata'));
			}
			ui.loading('export_simRep', false);
		},

		exportSimCSV: function () {
			if (store.repSimilarModules.data.results && store.repSimilarModules.data.results.length !== 0) {
				var reportDownload = 'Similarity;Object 1;Object 2\r\n';
				
				store.repSimilarModules.data.results.forEach(function(i){ 
					reportDownload += i[0] + ';' + i[1][0] + ';'  + i[1][1] + '\r\n'; 
				});

				util.downloadFile(reportDownload, 'fastclass_similarModules_' + 
					Date.now() + '.csv', true);
			} else {
				ui.showModal(l('work_no_classdata'));
			}
			ui.loading('export_simRepCSV', false);
		},

		exportSimReport: function () {
			if (store.repSimilarModules.data.results.length !== 0) {
				// build ZIP-based FCM format
				require(['zip'], function (JSZip) {
					var zip = new JSZip();
				
					zip.folder('fastclass')
						.file("report.json", JSON.stringify(store.repSimilarModules));

					zip.generateAsync({
						type:'blob',
						compression: 'DEFLATE',
						compressionOptions : {
							// level between 1 (best speed) and 9 (best compression)
							level: 6 
						}
					}).then(function(content) {
					    util.downloadBlob(content, 
					    	util.createFileName(store.repSimilarModules.meta.reportName) + '.fcr');
					    ui.loading('save_fcm');
					});
				});
			} else {
				ui.showModal(l('work_no_model'));
				ui.loading('save_fcm');
			}
		},*/

		registerExportHandlers: function(panel) {
			var enabledHandlers = config.getParam('enabledExports')[panel];

			enabledHandlers.forEach(function (id) {
				if (store.registeredHandlers.indexOf(id) === -1) {
					require(['controller/export/' + id], function (handler) {
						if (handler.condition()) {
							var meta = handler.register();

							bind.createMenuItem('exports-' + 
								panel, 'export-' + 
								id, meta.label);

							ui.click('export-' + id, function(elem) {
								elem.preventDefault();

								handler.execute()
									.then(function(data) {
										if (meta.hasOwnProperty('extension')) {
											var isJSON = (meta.extension.toLowerCase() === 'json');
											var name = util.createFileName(meta.filename) + '.' + meta.extension;
											util.downloadFile(data, name, !isJSON);
										}
									})
									.catch(function (err) {
										ui.showModal('Oh Shit! ' + err);
									})
									.finally(function () {
										ui.loading('export-' + id, false);									
									});
								
							});

							store.registeredHandlers.push(id);
						} else {
							ui.showModal('I\'m afraid I can\'t do that, Dave');
						}
					});
				}
			});
		}
	};

	// fix scoping
	return work;
});