// Onegeo' pure JS client

function OnegeoClient(baseUrl) {

	if (window.XMLHttpRequest) {
		this.xhr = new window.XMLHttpRequest();
	};

	this.baseUrl = baseUrl || null;
	this.basicAuth = null;

	this.action = {
		get: function(path, obj) {
			return this.__request({
				method: 'GET',
				path: path,
				successful: function() {
					return typeof obj.successful === 'function' && obj.successful.call(this.xhr, JSON.parse(this.xhr.responseText));
				}.bind(this),
				failure: obj.failure,
				before: obj.before,
				lastly: obj.lastly
			});
		}.bind(this),
		post: function(path, obj) {
			return this.__request({
				method: 'POST',
				data: JSON.stringify(obj.data),
				path: path,
				successful: function() {
					return typeof obj.successful === 'function' && obj.successful.call(this.xhr);
				}.bind(this),
				failure: obj.failure,
				before: obj.before,
				lastly: obj.lastly
			});
		}.bind(this),
		put: function(path, obj) {
			return this.__request({
				method: 'PUT',
				data: JSON.stringify(obj.data),
				path: path,
				successful: function() {
					return typeof obj.successful === 'function' && obj.successful.call(this.xhr);
				}.bind(this),
				failure: obj.failure,
				before: obj.before,
				lastly: obj.lastly
			});
		}.bind(this),
		delete: function(path, obj) {
			return this.__request({
				method: 'DELETE',
				path: path,
				successful: function() {
					return typeof obj.successful === 'function' && obj.successful.call(this.xhr);
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
	this.action.get('/sources', {
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

	this.basicAuth = 'Basic ' + btoa('admin:passpass');  // ATTENTION !!!

	this.xhr.open(obj.method, this.baseUrl ? this.baseUrl + obj.path : obj.path, true);

	this.xhr.onload = function(evt) {
		if (this.status == 200) {  // Done
			typeof obj.successful === 'function' && obj.successful.call(this);
		} else if (this.status == 201) {  // Created
			typeof obj.successful === 'function' && obj.successful.call(this, this.getResponseHeader('Location'));
		} else if (this.status == 204) {  // No content
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

	this.xhr.setRequestHeader('Content-Type', 'application/json');
	this.xhr.setRequestHeader('Authorization', this.basicAuth);
	this.xhr.send(obj.data);
};


OnegeoClient.prototype.getSources = function(onSuccessCallback, onFailureCallback) {
	this.action.get('/sources', {successful: onSuccessCallback, failure: onFailureCallback});
};

OnegeoClient.prototype.getIndexes = function(onSuccessCallback, onFailureCallback) {
	this.action.get('/indexes', {successful: onSuccessCallback, failure: onFailureCallback});
};

OnegeoClient.prototype.getServices = function(onSuccessCallback, onFailureCallback) {
	this.action.get('/services', {successful: onSuccessCallback, failure: onFailureCallback});
};
