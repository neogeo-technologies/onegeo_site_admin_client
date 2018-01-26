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
				lastly: obj.lastly,
				downprogress: obj.downprogress
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
				lastly: obj.lastly,
				upprogress: obj.upprogress
			});
		}.bind(this),
		put: function(path, obj) {
			return this.__request({
				method: 'PUT',
				data: JSON.stringify(obj.data),
				path: path,
				successful: function() {
					console.log(0);
					return typeof obj.successful === 'function' && obj.successful.call(this.xhr);
				}.bind(this),
				failure: obj.failure,
				before: obj.before,
				lastly: obj.lastly,
				upprogress: obj.upprogress
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
				lastly: obj.lastly,
				upprogress: obj.upprogress
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
		lastly: <function>,
		progress: <function>,
		upload: <function>
	}
	*/

	this.xhr.open(obj.method, this.baseUrl ? this.baseUrl + obj.path : obj.path, true);

	this.xhr.onload = function(evt) {
		if ([200, 202, 204].indexOf(this.status) > -1) {
			return typeof obj.successful === 'function' && obj.successful.call(this);
		};
		if (this.status == 201) {
			return typeof obj.successful === 'function' && obj.successful.call(this, this.getResponseHeader('Location'));
		};
		return typeof obj.failure === 'function' && obj.failure.call(this);
	};

	this.xhr.onloadstart = function(evt) {
		typeof obj.before === 'function' && obj.before.call(this);
	};

	this.xhr.onloadend = function(evt) {
		typeof obj.lastly === 'function' && obj.lastly.call(this);
	};

	this.xhr.onprogress = function(evt) {
		typeof obj.downprogress === 'function' && obj.downprogress.call(this, evt);
	};

	this.xhr.upload.onprogress = function(evt) {
		typeof obj.upprogress === 'function' && obj.upprogress.call(this, evt);
	};

	this.xhr.setRequestHeader('Content-Type', 'application/json');
	this.xhr.setRequestHeader('Authorization', this.basicAuth);
	this.xhr.send(obj.data);
};
