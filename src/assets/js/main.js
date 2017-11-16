var Context = function(location, name, columns, resource_location, reindex_frequency){
    this.location = location;
    this.name = name;
    this.columns = columns;
    this.resource = resource_location;
    this.reindex_frequency = reindex_frequency || 'monthly';
};

Context.prototype.constructor = Context;

var Resource = function(location, name, columns, index){
    this.location = location;
    this.name = name;
    this.columns = columns;
    this.index = index;
};

Resource.prototype.constructor = Resource;

var Source = function(location, uri, name, mode){
    this.location = location;
    this.uri = uri;
    this.name = name;
    this.mode = mode;
    this.resources = [];
};

Source.prototype.constructor = Source;

Source.prototype.addResources = function(resources) {
    this.resources = resources;
};


function $ajax(url, type, data, onSuccess, onFailure, onDone, onAlways) {
    let params = {
        success: onSuccess,
        type: type,
        url: url
    };
    if (data) {
        params.data = data;
    };
    if (type == 'POST' || type == 'PUT') {
        params.contentType = 'application/json; charset=UTF-8';
    };
    $.ajax(params).done(onDone).fail(onFailure).always(onAlways);
};


function httpPut(data, onSuccess, onFailure, onDone, onAlways){
    $ajax(this.url + '/' + data.location, 'PUT', JSON.stringify(data), onSuccess, onFailure, onDone, onAlways);
};


function httpDelete(location, onSuccess, onFailure, onDone, onAlways){
    $ajax(this.url + location, 'DELETE', null, onSuccess, onFailure, onDone, onAlways);
};


var Method = {
    url: window.location.origin + '/api',
    getAvailableSources: function(onSuccess, onFailure, onDone, onAlways){
        $ajax(this.url + '/sources_directories', 'GET', null, onSuccess, onFailure, onDone, onAlways);
    },
    getAvailableModes: function(onSuccess, onFailure, onDone, onAlways){
        $ajax(this.url + '/supported_modes', 'GET', null, onSuccess, onFailure, onDone, onAlways);
    },
    getSources: function(onSuccess, onFailure, onDone, onAlways){
        $ajax(this.url + '/sources', 'GET', null, function(resp){
            var arr = [];
            for (const r of resp) {
                arr.push(new Source(r.location, r.uri, r.name, r.mode));
            };
            onSuccess(arr);
        }, onFailure, onDone, onAlways);
    },
    getResources: function(source_location, onSuccess, onFailure, onDone, onAlways){
        $ajax(this.url + source_location + '/resources', 'GET', null, function(resp){
            var arr = [];
            for (const r of resp) {
                arr.push(new Resource(r.location, r.name, r.columns, r.index));
            };
            onSuccess(arr);
        }, onFailure, onDone, onAlways);
    },
    getContexts: function(onSuccess, onFailure, onDone, onAlways){
        $ajax(this.url + '/indices', 'GET', null, function(resp){
            const arr = [];
            for (const r of resp) {
                arr.push(new Context(r.location, r.name, r.columns, r.resource, r.reindex_frequency));
            };
            onSuccess(arr);
        }, onFailure, onDone, onAlways);
    },
    getContext: function(options, onSuccess, onFailure, onDone, onAlways){
        let location, params;
        if (typeof options === 'string') {
            location = options;
        } else if (typeof options === 'object') {
            location = options.location;
            params = options.params;
        };
        $ajax(this.url + location, 'GET', params, function(resp){
            onSuccess(new Context(resp.location, resp.name, resp.columns, resp.resource, resp.reindex_frequency));
        }, onFailure, onDone, onAlways);
    },
    getContextTasks: function(context_location, onSuccess, onFailure, onDone, onAlways){
        $ajax(this.url + context_location + '/tasks', 'GET', null, onSuccess, onFailure, onDone, onAlways);
    },
    getAnalyzers: function(onSuccess, onFailure, onDone, onAlways){
        $ajax(this.url + '/analyzers', 'GET', null, onSuccess, onFailure, onDone, onAlways);
    },
    getFilters: function(onSuccess, onFailure, onDone, onAlways){
        $ajax(this.url + '/tokenfilters', 'GET', null, onSuccess, onFailure, onDone, onAlways);
    },
    getTokenizers: function(onSuccess, onFailure, onDone, onAlways){
        $ajax(this.url + '/tokenizers', 'GET', null, onSuccess, onFailure, onDone, onAlways);
    },
    getModels: function(onSuccess, onFailure, onDone, onAlways){
        $ajax(this.url + '/profiles', 'GET', null, onSuccess, onFailure, onDone, onAlways);
    },
    postSource: function(data, onSuccess, onFailure, onDone, onAlways){
        $ajax(this.url + '/sources', 'POST', JSON.stringify(data), onSuccess, onFailure, onDone, onAlways);
    },
    postContext: function(data, onSuccess, onFailure, onDone, onAlways){
        $ajax(this.url + '/indices', 'POST', JSON.stringify(data), onSuccess, onFailure, onDone, onAlways);
    },
    postAnalyzer: function(data, onSuccess, onFailure, onDone, onAlways){
        $ajax(this.url + '/analyzers', 'POST', JSON.stringify(data), onSuccess, onFailure, onDone, onAlways);
    },
    postFilter: function(data, onSuccess, onFailure, onDone, onAlways){
        $ajax(this.url + '/tokenfilters', 'POST', JSON.stringify(data), onSuccess, onFailure, onDone, onAlways);
    },
    postTokenizer: function(data, onSuccess, onFailure, onDone, onAlways){
        $ajax(this.url + '/tokenizers', 'POST', JSON.stringify(data), onSuccess, onFailure, onDone, onAlways);
    },
    postModel: function(data, onSuccess, onFailure, onDone, onAlways){
        $ajax(this.url + '/profiles', 'POST', JSON.stringify(data), onSuccess, onFailure, onDone, onAlways);
    },
    getTask: function(location, onSuccess, onFailure, onDone, onAlways){
        $ajax(this.url + '/' + location, 'GET', null, onSuccess, onFailure, onDone, onAlways);
    },
    action: function(data, onSuccess, onFailure, onDone, onAlways){
        $ajax(this.url + '/action', 'POST', JSON.stringify(data), onSuccess, onFailure, onDone, onAlways);
    },
    putContext: httpPut,
    putAnalyzer: httpPut,
    putFilter: httpPut,
    putTokenizer: httpPut,
    putModel: httpPut,
    deleteSource: httpDelete,
    deleteContext: httpDelete,
    deleteAnalyzer: httpDelete,
    deleteFilter: httpDelete,
    deleteTokenizer: httpDelete,
    deleteModel: httpDelete
};
