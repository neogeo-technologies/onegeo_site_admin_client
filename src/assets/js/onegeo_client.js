var cookiekey  = window.location.host;

const setCookie = function(key, data, hours) {
	if (hours) {
		var date = new Date();
		date.setTime(date.getTime() + (hours * 60 * 60 * 1000));
		var expires = '; expires=' + date.toGMTString();
	} else {
		var expires = '';
	};
	document.cookie = key + '=' + data + expires + '; path=/';
};

const getCookie = function(key) {
	var re = new RegExp(key + '=([^;]+)');
	var value = re.exec(document.cookie);
	return (value != null) ? unescape(value[1]) : null;
};

const deleteCookie = function(key) {
	setCookie(key, '', -1);
};


function OnegeoClient(baseUrl) {

	console.log(baseUrl)

	if (window.XMLHttpRequest) {
		this.xhr = new window.XMLHttpRequest();
	};

	this.baseUrl = baseUrl || null;
	if (getCookie(cookiekey)) {
		user_data = atob(getCookie(cookiekey)).split(':');
		this.basicAuth = 'Basic ' + btoa(user_data[0] + ':' + user_data[1]);
		this.logged = true;
		// $('#identity').text(user_data[0]);
	} else {
		this.basicAuth = null;
	};

	this.action = {
		get: function(path, obj) {
			return this.__request({
				method: 'GET',
				data: obj.data,
				path: path,
				successful: function() {
					if (this.xhr.responseText) {
						return typeof obj.successful === 'function' && obj.successful.call(this.xhr, JSON.parse(this.xhr.responseText));
					} else {
						return typeof obj.successful === 'function' && obj.successful.call(this.xhr, this.xhr.responseText);
					};
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
					if (this.xhr.responseText) {
						return typeof obj.successful === 'function' && obj.successful.call(this.xhr, JSON.parse(this.xhr.responseText));
					}else{
						return typeof obj.successful === 'function' && obj.successful.call(this.xhr, this.xhr.responseText);
					}
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
	this.action.get('/api/sources', {
		successful: function() {
			setCookie(cookiekey, btoa(user + ':' + pwd), 1);
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
	deleteCookie(cookiekey);
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

	if (obj.method == 'GET' && obj.data) {
		obj.path += '?';
		for (const k in obj.data) {
			obj.path += '&' + k + '=' + obj.data[k];
		};
		obj.data = undefined;
	};

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
