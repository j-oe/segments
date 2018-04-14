/** 
	fastclass
	LOCAL BROWSER STORAGE 
	- native localStorage for indexing and settings
	- localforage for IndexedDB API
	(c) 2017 Jan Oevermann
	jan.oevermann@hs-karlsruhe.de
	License: MIT

*/

define(['localforage'], function (localforage) {

	var local = {
		
		idx: 'fc_index',
		key: 'fc_license',
		set: 'fc_settings',

		init: function () {
			var index = localStorage.getItem(local.idx),
				settings = localStorage.getItem(local.set);
			// initialize index if there is none
			if (index === null) {
				localStorage.setItem(local.idx, '[]');
			}
			// load settings if there are some saved
			if (settings !== null) {
				local.loadSettings();
			}
			localforage.config({
				name: 'fastclass'
			});
		},

		getKey: function () {
			return localStorage.getItem(local.idx);
		},

		clear: function () {
			localStorage.clear();
			return localforage.clear();
		},

		getModels: function () {
			var index = local._getIndex(),
				models = index.filter(function (entry) {
					return entry.type === 'model';
				});

			return models; 
		},

		getReports: function () {
			var index = local._getIndex(),
				reports = index.filter(function (entry) {
					return entry.type === 'report';
				});

			return reports; 
		},

		storeModel: function (model) {
			var mID = model.meta.modelID,
				mName = model.meta.modelName;

			local._addModelToIndex(mID, mName, 'model');
			return localforage.setItem(mID, model);
		},

		storeReport: function (report) {
			var rID = report.meta.reportID,
				rName = report.meta.reportName;

			local._addModelToIndex(rID, rName, 'report');
			return localforage.setItem(rID, report);
		},
		
		loadModel: function (modelID) {
			return localforage.getItem(modelID);
		},

		deleteModel: function (modelID) {
			local._removeModelFromIndex(modelID);
			return localforage.removeItem(modelID);
		},

		saveSettings: function (config) {
			localStorage.setItem(local.set, JSON.stringify(config));
		},

		loadSettings: function () {
			return localStorage.getItem(local.set);
		},

		resetSettings: function () {
			localStorage.removeItem(local.set);
		},

		_getIndex: function (index) {
			return JSON.parse(localStorage.getItem(local.idx));
		},

		_updateIndex: function (index) {
			localStorage.setItem(local.idx, JSON.stringify(index));
		},

		_addModelToIndex: function (id, name, type) {
			var index = local._getIndex();
			index.push({id: id, name: name, type: type});
			local._updateIndex(index);
		},

		_removeModelFromIndex: function (id) {
			var index = local._getIndex(),
				pos = index.map(function(e) { return e.id; }).indexOf(id);
			index.splice(pos, 1);	
			local._updateIndex(index);
		}
	};

	// fix scoping
	return local;
});