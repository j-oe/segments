/** 
	fastclass 
	BIND MODULE
	(c) 2016 Jan Oevermann
	jan.oevermann@hs-karlsruhe.de
	License: MIT

*/

define(['config/params', 'view/ui', 'controller/store', 'controller/local', 'helper/util', 'diff'], 
	function (config, ui, store, local, util, diff) {
	var bind = {

		addFile: function() {
			ui.loading('add_data', false);
			
			ui.e('userinput').value = null;
			ui.hide(['disclaimer', 'import_xml', 'import_json','load_fcm']);

			bind.resetXMLoptions();

			ui.show('importFile');
		},

		getIndicator: function (value, property) {
			var indication = 'neutral';

			if (config.getParam('indicators')) {
				var indicatorType = config.getConfig().indicatorValues[property].type,
					indicatorValue = config.getConfig().indicatorValues[property].values;

				if (indicatorType === 'range') {
					if (value <= indicatorValue[0]) indication = 'bad';
					if (value > indicatorValue[0] && value < indicatorValue[1]) indication = 'good';
					if (value > indicatorValue[1] && value < indicatorValue[2]) indication = 'medium';
					if (value > indicatorValue[2]) indication = 'bad';
				}

				if (indicatorType === 'scale') {
					if (value <= indicatorValue[0]) indication = 'bad';
					if (value > indicatorValue[0]) indication = 'medium';
					if (value > indicatorValue[1]) indication = 'good';
				}
			}

			return '<span class="indicator indicator-' + indication + '"></span>';
		},

		setClassificationProgress: function (progress, elem_prog, elem_bar) {
			var el_bar = elem_bar || 'status_cl_bar',
				el_prog = elem_prog || 'status_cl';
			
			ui.show(el_bar, 'inline-block');

			ui.e(el_prog).style = 'width:' + progress;
			ui.e(el_prog)['data-tooltip'] = progress;
			/*ui.e(el_prog).innerHTML = progress;*/
		},

		showNewModal: function () {
			ui.e('new-modal').classList.add('active');

			ui.click(['new-modal-x', 'new-modal-overlay', 'new-modal-cancel'], function (e){
				ui.loading(e.target.id, false);
				ui.e('new-modal').classList.remove('active');
			});
		},

		showDiffModal: function () {
			ui.e('diff-modal').classList.add('active');

			ui.click(['diff-modal-x', 'diff-modal-overlay', 'diff-modal-cancel'], function (e){
				ui.loading(e.target.id, false);
				ui.e('diff-modal').classList.remove('active');
			});
		},

		showLoadModal: function (data) {
			// init load modal
			ui.e('load-modal').classList.add('active');
			ui.show('no-local-models');
			ui.hide('load_localModel');

			ui.click(['load-modal-x', 'load-modal-overlay'], function (e){
				ui.loading(e.target.id, false);
				ui.e('load-modal').classList.remove('active');
			});

			// get default panel
			if (data && data.length > 0) {
				bind.showLocalModels(data);
				refreshModal('from-browser');
			} else {
				refreshModal('from-filesystem');
			}	

			// render tabs and panels
			ui.q('#load-modal .tab-item').forEach(function (elem) {
				elem.addEventListener('click', function (e) {
					e.preventDefault();
					refreshModal(e.target.id);
				});
			});

			function refreshModal (activeTabID) {
				ui.q('#load-modal .tab-item a').forEach( function (tab) {
					tab.classList.remove('active');
					ui.hide('load-' + tab.id);
				});

				ui.e(activeTabID).classList.add('active');
				ui.show('load-' + activeTabID, 'flex');
			}		
		},

		showSettingsModal: function () {
			var params = config.getWritableConfig();

			ui.empty('settings');

			Object.keys(params).forEach(function(key) {
				var param = params[key];

				var row = ui.create('tr'),
					label = ui.create('th'),
					setting = ui.create('td');

				label.innerText = param.label;
				ui.append(row, [label, setting]);

				switch (param.type) {
					case 'list':
						var list = ui.create('select');
						list.id = 'setting-' + key;
						
						ui.append(setting, list);
						
						ui.append(ui.e('settings'), row);

						// build list with available options
						util.requireCSS('vendor/selectize.css');
						require(['selectize'], function (selectize) {
							$('#setting-' + key).selectize({
								items: [config.getParam(key)],
								options: param.values,
								maxItems: 1,
								onChange: function (val) {
									config.setParam(key, val);
								}
							});
						});
						break;

					case 'range':
						var slider = ui.create('input');
						
						slider.id = 'setting-' + key;
						slider.type = 'range';
						slider.value = config.getParam(key);
						slider.min = param.values.min;
						slider.max = param.values.max;
						slider.step = param.values.step;

						slider.classList.add('slider');
						slider.classList.add('tooltip');

						slider.dataset.tooltip = config.getParam(key);
						
						ui.append(setting, slider);
						ui.append(ui.e('settings'), row);

						ui.bind('setting-' + key, 'input', function(e) {
							var value = e.target.value;
							slider.dataset.tooltip = value;
							config.setParam(key, parseFloat(value));
						});
						break;

					case 'boolean':
						var group = ui.create('label'),
							input = ui.create('input'),
							icon = ui.create('i');

						group.classList.add('form-switch');
						icon.classList.add('form-icon');
						
						input.type = 'checkbox';
						input.checked = config.getParam(key);
						input.id = 'setting-' + key;

						var state = (config.getParam(key)) ? 'aktiv' : 'inaktiv',
							textnode = ui.create('span');

						textnode.innerText = state;

						ui.append(group, [input, icon, textnode]);

						ui.append(setting, group);
						ui.append(ui.e('settings'), row);

						ui.bind('setting-' + key, 'change', function(e) {
							var value = e.target.checked;
							textnode.innerText = (value) ? 'aktiv' : 'inaktiv';
							config.setParam(key, value);
						});
						break;

					case 'string':
						var text = ui.create('input');

						text.classList.add('form-input');
						
						text.type = 'text';
						text.value = config.getParam(key);
						text.id = 'setting-' + key;

						ui.append(setting, text);
						ui.append(ui.e('settings'), row);

						ui.bind('setting-' + key, 'blur', function(e) {
							var value = e.target.value;
							config.setParam(key, value);
						});
						break;

					default:
						console.log('skipping complex object');

				}

				// init load modal
				ui.e('set-modal').classList.add('active');
				ui.loading('change_set');

				ui.click(['set-modal-x', 'set-modal-overlay'], function (e){
					ui.loading(e.target.id, false);
					ui.loading('change_set', false);
					ui.e('set-modal').classList.remove('active');
				});

				
			});
		},

		showLocalModels: function (models) {
			ui.hide('no-local-models');
			ui.show('load_localModel');
			// lazy requiring dependecy-heavy selectitze plugin
			util.requireCSS('vendor/selectize.css');
			require(['selectize'], function (selectize) {

				function toDataObj (dataArray) {
					return dataArray.map(function (item) {
						return {text: item.name, value: item.id};
					});
				}

				$('#localModel').selectize({
					options: toDataObj(models),
					selectOnTab: true
				});
			});
		},

		closeModalAndContinue: function (modal, nextView, unload) {
			// stop loading animation on buttons
			if (unload) ui.loading(unload, false);
			// close modal 
			ui.e(modal).classList.remove('active');
			// move on
			if (nextView) {
				window.location.hash = nextView;
				if (nextView === 'training') {
					ui.unlockPanels();
				}
			}
		},

		fillWithDemoData: function (metaData, example) {
			// training
			window.location.hash = 'training';
			bind.printTrainingAnalysis(metaData);
			ui.hide(['importFile', 'downloadMemory']);
			// classification (PDF)
			ui.hide(['prepareClassificationData', 'downloadResults', 'userinput_cl', 'disclaimer_cl']);
			ui.hide(['panelTitle', 'panelTitle_cl']);
			ui.show('disclaimer_demo');
			// get data for PDF visualizations
			ui.show('import_demo');
			// authoring
			ui.e('textinput').value = example;
		},

		printTrainingAnalysis: function (data) {
			ui.show(['manageModel', 'trainingAnalysis']);
			ui.hide(['importFile', 'xmlAnalysis', 'panelTitle', 'prepareTrainingData']);

			var timeInSec = Math.round(data.trainingDuration / 10) / 100;

			if (store.model.meta.modelName) ui.e('model-name').innerText = store.model.meta.modelName;

			bind.clearTrainingAnalysis();

			ui.content({
				'tA_cnt': data.analyzedObjects + bind.getIndicator(data.analyzedObjects, 'nrOfObjects'),
				'tA_cls': data.analyzedClasses + bind.getIndicator(data.analyzedClasses, 'nrOfClasses'),
				'tA_avg': data.averageWordCount + bind.getIndicator(data.averageWordCount, 'sizeOfObjects'),
				'tA_tme': timeInSec + 's' + bind.getIndicator(timeInSec, 'timeElapsed')
			});

			// lazy requiring plot module
			require(['view/plot'], function (plot) {
				plot.pieChartClassDistribution('tA_plot', data.classDistribution);
			});
		},

		clearModel: function () {
			ui.hide(['trainingAnalysis', 'xmlAnalysis']);
			ui.show(['importFile']);
			bind.clearTrainingAnalysis();
			ui.e('userinput').value = null;
		},

		clearTrainingAnalysis: function () {
			ui.content({
				'tA_cnt': '?',
				'tA_cls': '?',
				'tA_avg': '?',
				'tA_tme': '?'
			});
		
			ui.empty('tA_plot');
		},

		printReportAnalysis: function (report) {
			ui.show(['reportAnalysis', 'manageReport']);
			ui.hide(['importFile_rp', 'panelTitle_rp', 'xmlAnalysis_rp', 'reportSettings']);

			if (report.meta.reportName) ui.e('report-name').innerText = report.meta.reportName;

			var timeInSec = Math.round(report.meta.timeElapsed / 10) / 100,
				objects = report.data.sources.length,
				combinations = (objects * (objects - 1)) / 2,
				distribution = report.data.results.map(function(i) { return i[0]; });

			ui.content({
				'rA_idf': report.data.results.length,
				'rA_cnt': objects,
				'rA_com': combinations,
				'rA_tme': timeInSec + 's'
			});

			// lazy requiring plot module
			require(['view/plot'], function (plot) {
				plot.histogramSimDist('rA_histogramChart', distribution);
				plot.forceDirectedGraph('rA_graph', report.data.mapping);
				plot.dataTableSimilarities('rA_table', report.data);
				bind.enableDiffingBtns();
				bind.enableGroupBtns();
			});
		},

		enableDiffingBtns: function () {
			ui.qA('.diff').forEach(function(btn){
				btn.addEventListener('click', function (e) {
					e.preventDefault();
					bind.showDiffingViewWithWorker(e.target.dataset, e.target.id);
				});
			}); 
		},

		enableGroupBtns: function () {
			ui.qA('.group').forEach(function(btn){
				btn.addEventListener('click', function (e) {
					e.preventDefault();
					require(['view/plot'], function (plot) {
						plot.filterDataTableSimilarities('rA_table', e.target.innerText);
					});
				});
			}); 
		},

		showDiffingView: function (data, id) {
			var sourceID = data.source,
				targetID = data.target,
				sourceTxt, targetTxt,
				sourceDsc, targetDsc;

			ui.loading(id);

			/* get text from input data */
			store.repSimilarModules.data.sources.forEach(function(module){
				if (module.xid === sourceID) {
					sourceTxt = module.txt;
					sourceDsc = module.dsc;
				}
				if (module.xid === targetID) {
					targetTxt = module.txt;
					targetDsc = module.dsc;
				}
			});

			/* generate diff */
			var output = diff.diffWords(sourceTxt, targetTxt);
				
			/* render diff */
			ui.empty('diff-body');

			var	outputElem = ui.e('diff-body'),
				outputFrag = document.createDocumentFragment();

			var plus = 0, minus = 0;

			output.forEach(function(part){
				var mod = (part.added || part.removed) ? true : false,
					color = part.added ? 'text-primary' : part.removed ? 'text' : 'text-secondary',
					span = document.createElement('span');
			  	span.classList.add(color);
			  	if (mod) span.classList.add('mod');
			  	if (part.added) plus++;
			  	if (part.removed) minus++;
			  	span.appendChild(document.createTextNode(part.value));
			  	outputFrag.appendChild(span);
			});

			var title = sourceDsc,
				titleAlt = '';
			if (sourceDsc !== targetDsc) titleAlt = '<br/>' + targetDsc;

			ui.content({
				'diff-details-t': title,
				'diff-details-ta': titleAlt,
				'diff-details-a': data.source,
				'diff-details-b': data.target,
				'diff-details-v': util.percent(data.value, 1, 4),
				'diff-details-p': '+' + plus,
				'diff-details-m': '-' + minus
			});

			ui.empty('diff-details-weighted-content');
			if (store.repSimilarModules.meta.weightedElements &&
				store.repSimilarModules.meta.weightedElements.length !== 0) {
				ui.show('diff-details-weighted');
				
				store.repSimilarModules.meta.weightedElements.forEach(function (elem){
					var weightedElement = ui.create('small');
					weightedElement.classList.add('label','label-warning');
					weightedElement.innerText = elem;
					ui.append(ui.e('diff-details-weighted-content'), weightedElement);	
				});
			} else {
				ui.hide('diff-details-weighted');
			}

			/* show diff */
			outputElem.appendChild(outputFrag);
			bind.showDiffModal();

			ui.loading(id);

		},

		showDiffingViewWithWorker: function (diffingData, id) {
			ui.loading(id);

			var sourceID = diffingData.source,
				targetID = diffingData.target,
				sourceTxt, targetTxt,
				sourceDsc, targetDsc;

			/* get text from input data */
			store.repSimilarModules.data.sources.forEach(function(module){
				if (module.xid === sourceID) {
					sourceTxt = module.txt;
					sourceDsc = module.dsc;
				}
				if (module.xid === targetID) {
					targetTxt = module.txt;
					targetDsc = module.dsc;
				}
			});


			var diffWorker = new Worker(config.getParam('dfWorkerURL'));

			diffWorker.addEventListener('error', function (err) {
				ui.showModal(l('work_proc_pdf'));
			});

			diffWorker.addEventListener('message', function (msg) {
				if (msg.data.ready) {
					diffWorker.postMessage(['diffData', sourceTxt, targetTxt]);
				} else {
					var output = msg.data[0];

					diffWorker.terminate();

					/* render diff */
					ui.empty('diff-body');

					var	outputElem = ui.e('diff-body'),
						outputFrag = document.createDocumentFragment();

					var plus = 0, minus = 0;

					output.forEach(function(part){
						var mod = (part.added || part.removed) ? true : false,
							color = part.added ? 'text-primary' : part.removed ? 'text' : 'text-secondary',
							span = document.createElement('span');
					  	span.classList.add(color);
					  	if (mod) span.classList.add('mod');
					  	if (part.added) plus++;
					  	if (part.removed) minus++;
					  	span.appendChild(document.createTextNode(part.value));
					  	outputFrag.appendChild(span);
					});

					var title = sourceDsc,
						titleAlt = '';
					if (sourceDsc !== targetDsc) titleAlt = '<br/>' + targetDsc;

					ui.content({
						'diff-details-t': title,
						'diff-details-ta': titleAlt,
						'diff-details-a': diffingData.source,
						'diff-details-b': diffingData.target,
						'diff-details-v': util.percent(diffingData.value, 1, 4),
						'diff-details-p': '+' + plus,
						'diff-details-m': '-' + minus
					});

					ui.empty('diff-details-weighted-content');
					if (store.repSimilarModules.meta.weightedElements &&
						store.repSimilarModules.meta.weightedElements.length !== 0) {
						ui.show('diff-details-weighted');
						
						store.repSimilarModules.meta.weightedElements.forEach(function (elem){
							var weightedElement = ui.create('small');
							weightedElement.classList.add('label','label-warning');
							weightedElement.innerText = elem;
							ui.append(ui.e('diff-details-weighted-content'), weightedElement);	
						});
					} else {
						ui.hide('diff-details-weighted');
					}

					/* show diff */
					outputElem.appendChild(outputFrag);
					bind.showDiffModal();

					ui.loading(id);
				}				
			});
		},

		printClassificationAnalysis: function (data, source) {
			ui.show(['manageClassification', 'classificationAnalysis']);
			ui.hide('classificationData', 'xmlAnalysis_cl', 'panelTitle_cl');

			ui.content({
				'clModelName': store.model.meta.modelName,
				'classifiedFile': store.classifiedFileSources.join(', ') + 
					'  (Typ: ' + source.toUpperCase() + ')'
			});

			var timeInSec = Math.round(data.tme / 10) / 100;

			ui.content({
				'cA_cnt':  data.cnt,
				'cA_tme':  timeInSec + 's',
				'cA_cls':  data.dis.length,
				'cAM_cls': store.model.meta.analyzedClasses
			});

			// lazy requiring plot module
			require(['view/plot'], function (plot) {
				ui.empty(['cA_plot', 'cA_histogramChart']);
				
				plot.pieChartClassDistribution('cA_plot', data.dis);
				plot.histogramConfDist('cA_histogramChart', data.arr);

				if (source === 'pdf') {
					ui.show(['classDistributionAnalysis', 'confidenceAnalysis']);

					plot.scatterPlotClassDist('cA_scatterPlot', data.arr);
					plot.lineChartConfidenceTrans('cA_lineChart', data.arr);
				}
			});			
		},

		printClassificationAnalysisText: function (data) {
			ui.show('classificationAnalysisText');

			var timeInSec = Math.round(data.time / 10) / 100;

			ui.content({
				'cAT_clf': data.pred,
				'cAT_cfd': data.conf + '%',
				'cAT_tme': timeInSec + 's'
			});
			
			// lazy requiring plot module
			require(['view/plot'], function (plot) {
				ui.empty('cAT_plot');
				plot.barChartClassScores('cAT_plot', data.info);
			});
				
		},

		prepareQualityAnalysis: function (options) {
			ui.show('qsAnalysis', 'flex');
			if (options[0]) { // svl
				ui.show('tA_svl_panel', 'flex');
			}
			if (options[1]) { // cvl
				ui.show('tA_cvl_panel', 'flex');
			}
			ui.loading('qs');
		},

		printQualityScore: function (label, score) {
			ui.content('tA_' + label, score + '%');				
					
			// lazy requiring plot module
			require(['view/plot'], function (plot) {
				ui.empty('tA_' + label +'_g');
				plot.pieChartGauge('tA_' + label +'_g', score);
			});
		},

		resetXMLoptions: function (classify) {
			var suffix = (classify) ? '_cl' : '';

			// lazy requiring dependecy-heavy selectitze plugin
			util.requireCSS('vendor/selectize.css');
			require(['selectize'], function (selectize) {
				var selectAttrInstance = $('#xmlAttr' + suffix).selectize();
					selectElemInstance = $('#xmlElem' + suffix).selectize();

				if (selectAttrInstance && selectElemInstance) {
					selectAttrInstance[0].selectize.clearOptions();
					selectElemInstance[0].selectize.clearOptions();
				}
			});
		},

		printXMLoptions: function (xmlMap, target) {
			var suffix = '';
			if (target === 'classify') suffix = '_cl';
			if (target === 'report') suffix = '_rp';

			var sortedElements = Object.keys(xmlMap).sort();
			
			// lazy requiring dependecy-heavy selectitze plugin
			util.requireCSS('vendor/selectize.css');
			require(['selectize'], function (selectize) {

				ui.show('xmlAnalysis' + suffix);

				if (target !== 'classify') {
					var signalsEnabled = config.getParam('signalsEnabled');

					ui.show('showSignalSelection' + suffix);
					ui.e('showSignalSelection' + suffix).checked = config.getParam('signalsEnabled');

					if (signalsEnabled) {
						$('#signalSelection' + suffix).show();
					}

					ui.click('showSignalSelection' + suffix, function() {
						config.setParam('signalsEnabled', ui.e('showSignalSelection' + suffix).checked);
						$('#signalSelection' + suffix).toggle();
					});

					$('#xmlElemSignal' + suffix).selectize({
						options: toDataObj(sortedElements)
					});

					/*ui.content('signalWeightValue' + suffix, config.getParam('signalWeighting')+  'x');
					ui.e('signalWeight' + suffix).value = config.getParam('signalWeighting');

					ui.bind('signalWeight' + suffix, 'input', function (e) {
						var signalWeight = e.target.value;
						config.setParam('signalsEnabled', true); 
						config.setParam('signalWeighting', signalWeight); 
						ui.content('signalWeightValue' + suffix, signalWeight + 'x'); 
					});*/
				}
				
				$('#xmlAttr' + suffix).selectize({
					options: [],
					onChange: function (val) {
						if (val !== '') {
							ui.show('import_xml' + suffix);
						} else {
							ui.hide('import_xml' + suffix);
						}
					}
				});

				$('#xmlElem' + suffix).selectize({
					options: toDataObj(sortedElements),
					selectOnTab: true,
					onChange: function () {
						updateAttributes();
					}
				});

				function toDataObj (dataArray) {
					return dataArray.map(function (item) {
						return {text: item, value: item};
					});
				}

				function getValidAttributes () {
					var selectedElements = [],
						validAttributes = [];

					ui.q('#xmlElem' + suffix +' option:checked').forEach(function (item) {
						selectedElements.push(item.value);
					});

					for (var i = 0; i < selectedElements.length; i++) {
						/* jshint loopfunc: true */
						var currentElement = selectedElements[i],
							elementAttrs = Object.keys(xmlMap[currentElement]);
						// if more than one element, find intersection between attributes
						if (i > 0) {
							validAttributes = validAttributes.filter(function (n) {
							    return elementAttrs.includes(n);
							});
						} else {
							validAttributes = validAttributes.concat(elementAttrs);
						} 
					}

					return toDataObj(validAttributes.sort());				
				}

				function updateAttributes () {
					var	validAttributes = getValidAttributes(),
						selectInstance = $('#xmlAttr' + suffix).selectize();

					selectInstance[0].selectize.clearOptions();
					selectInstance[0].selectize.addOption(validAttributes);
					selectInstance[0].selectize.refreshOptions();
				}
			});
		},

		getXMLoptions: function (target) {
			var suffix = '';
			if (target === 'classify') suffix = '_cl';
			if (target === 'report') suffix = '_rp';

			var selectOption = ui.e('xmlAttr' + suffix).value,
				selectElements = [], signalElements = [];

			ui.q('#xmlElem' + suffix + ' option:checked').forEach(function (entry) {
				selectElements.push(entry.value);
			});	

			if (target !== 'classify') {
				ui.q('#xmlElemSignal' + suffix + ' option:checked').forEach(function (entry) {
					signalElements.push(entry.value);
				});
			}

			store.xmlParsingSettings = [selectElements, selectOption, signalElements];
			return store.xmlParsingSettings;
		},

		getQSoptions: function () {
			var svl_Checked = ui.e('tA_svl_mode').checked,
				cvl_Checked = ui.e('tA_cvl_mode').checked;

			return [svl_Checked, cvl_Checked];
		},

		getTextFromUserInput: function () {
			var textInput = ui.e('textinput').value,
				sanitizedInput = textInput.replace(/(\r?\n)+|(\r)+/g, ' ');
			return sanitizedInput;
		},

		createMenuItem: function (menu, id, label) {
			var parent = ui.e(menu);
			var li = ui.create('li');
			var a = ui.create('a');
			
			li.classList.add('menu-item');
			
			a.classList.add('no-link');
			a.href = '#';
			a.id = id;
			a.innerText = label;

			ui.append(parent, li);
			ui.append(li, a);
		}
	};

	// fix scoping
	return bind;
});