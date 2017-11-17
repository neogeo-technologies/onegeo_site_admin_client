// Onegeo' pure JS client

function SearchProfile(obj) {
	this.location = obj.location;
	this.name = obj.name;
	this.indices = obj.indices;
	this.extended = obj.extended;
	this.serviceUrl = obj.location + '/search?';
};

SearchProfile.prototype.constructor = SearchProfile;

function IndexProfile(obj) {
	this.location = obj.location;
	this.name = obj.name;
	this.columns = obj.columns;
	this.reindexFrequency = obj.reindex_frequency || 'monthly';
	this.lastModification = undefined;
	this._resourceLocation = obj.resource;
};

IndexProfile.prototype.constructor = IndexProfile;

function Resource(obj) {
	this.location = obj.location;
	this.name = obj.name;
	this.columns = obj.columns;
	this.index = obj.index;
};

Resource.prototype.constructor = Resource;

function Source(obj) {
	this.location = obj.location;
	this.uri = obj.uri;
	this.name = obj.name;
	this.mode = obj.mode;
	this.resources = undefined;
};

Source.prototype.constructor = Source;

function OnegeoClient(baseUrl) {

	if (window.XMLHttpRequest) {
		this.xhr = new window.XMLHttpRequest();
	};

	this.baseUrl = baseUrl || null;
	this.basicAuth = null;

	this.api = {
		get: {
			sources: {
				parse: function(data) {
					const arr = [];
					for (const obj of data) {
						arr.push(new Source(obj));
					};
					return arr;
				}
			},
			resources: {
				parse: function(data) {
					const arr = [];
					for (const obj of data) {
						arr.push(new Resource(obj));
					};
					return arr;
				}
			},
			indices: {
				parse: function(data) {
					const arr = [];
					for (const obj of data) {
						arr.push(new IndexProfile(obj));
					};
					return arr;
				}
			},
			profiles: {
				parse: function(data) {
					const arr = [];
					for (const obj of data) {
						arr.push(new SearchProfile(obj));
					};
					return arr;
				}
			}
		},
		post: {},
		put: {},
		delete: {}
	};

	this.action = {
		get: function(action, obj) {
			return this.__request({
				method: 'GET',
				path: '/' + action,
				successful: function() {
					return typeof obj.successful === 'function' && obj.successful.call(this.xhr, eval('this.api.get.' + action + '.parse(JSON.parse(this.xhr.responseText))'));
				}.bind(this),
				failure: obj.failure,
				before: obj.before,
				lastly: obj.lastly
			});
		}.bind(this)
	};
};

OnegeoClient.prototype.constructor = OnegeoClient;

OnegeoClient.prototype.connect = function(user, pwd, cb) {
	this.basicAuth = 'Basic ' + btoa(user + ':' + pwd);
	this.action.get('sources', {
		successful: function() {
			this.logged = true;
		}.bind(this),
		failure: function() {
			this.logged = false;
		}.bind(this),
		lastly: function() {
			typeof cb === 'function' && cb(this.logged);
		}.bind(this)
	});
};

OnegeoClient.prototype.disconnect = function(cb) {
	this.basicAuth = null;
	this.__request({
		method: 'HEAD',
		path: '/',
		lastly: function() {
			this.logged = false;
			typeof cb === 'function' && cb(this.logged);
		}.bind(this)
	});
};

OnegeoClient.prototype.__request = function(obj) {

	/*
	obj = {
		method: <string>,
		path: <string>,
		data: <object>,
		before: <function>,
		successful: <function>,
		failure: <function>,
		lastly: <function>
	}
	*/

	// this.basicAuth = 'Basic ' + btoa('admin:passpass');  // ATTENTION !!!

	this.xhr.open(obj.method, this.baseUrl ? this.baseUrl + obj.path : obj.path, true);

	this.xhr.onload = function(evt) {
		if (this.status == 200) {
			typeof obj.successful === 'function' && obj.successful.call(this);
		} else {
			typeof obj.failure === 'function' && obj.failure.call(this);
		};
	};

	this.xhr.onloadstart = function(evt) {
		typeof obj.before === 'function' && obj.before.call(this);
	};

	this.xhr.onloadend = function(evt) {
		typeof obj.lastly === 'function' && obj.lastly.call(this);
	};

	this.xhr.setRequestHeader('Authorization', this.basicAuth);
	this.xhr.send(obj.data);
};
