var http = require('http');
var sys = require('sys');
var url = require('url');  // url.parse(foo, true) -> href, search, query {var: val}, pathname
require('./underscore');

var rest = exports;


var Rest = function() {
    Rest.resources.push(this);
};
Rest.regex = /\{(.*?)\}/g;
Rest.resources = [];
Rest.log = function(message) {
    sys.log("Node Rest Server: " + message);
}
Rest.prototype.path = function(path) {
    Rest.log("registering path as: " + path);
    var keys = Rest.regex.exec(path);
    Rest.log("found keyfields of: " + JSON.stringify(keys));
    if(keys === null) {
        this.keys_ = {};
        this.regex_ = new RegExp(path);
    } else {
        this.keys_ = keys.slice(1);
        this.regex_ = new RegExp(path.replace(Rest.regex, "([^\/]+)"));
    }
    this.path_ = path;
    return this;
};

Rest.prototype.as = function(as) {
    this.as_ = as;
    return this;
};

Rest.prototype.method = function(method) {
    this.method_ = method;
    return this;
};
Rest.prototype.handle = function(req, r) {
    Rest.log("resource is handling request: " + this.toString());
    Rest.log("Calling function: " + this.as_);
    var result = this.as_(req, r);
    Rest.log("Result: " + result);
    Rest.log("result: " + JSON.stringify(result));
    return result;
};
Rest.prototype.notFound = function(obj) {
    
};
Rest.prototype.toString = function() {
    return JSON.stringify(this);
};

Rest.start = function(port) {
    Rest.server.listen(8888);
};

// Helper functions
rest.path = function(path) {
    return (new Rest()).path(path);
};
rest.as = function(as) {
    return (new Rest()).as(as);
};
rest.method = function(method) {
    return (new Rest()).method(method);
};
rest.start = function() {
    Rest.start();
};
Rest.createServer = function() { 
    return http.createServer(function(req, res) {
        req.uri = url.parse(req.url, true);
        Rest.log("request to " + req.uri.pathname);
        var resource = _(Rest.resources).chain()
            .select(
                function(o) {
                    return req.uri.pathname.match(o.regex_) && req.method === o.method_;
                })
            .first()
            .value();
        Rest.log("selected resource to handle request: " + JSON.stringify(resource));
        if(_.isEmpty(resource)) {
            Rest.prototype.notFound(res);
        } else {
            req.pathParsed_ = {};
            Rest.log(typeof resource.regex_);
            if(typeof resource.regex_ !== "undefined") {
                Rest.log("Processing path params");
                req.pathValues_ = resource.regex_.exec(req.uri.pathname).slice(1);
                for(var i = 0; i < resource.keys_.length; i++) {
                    req.pathParsed_[resource.keys_[i]] = req.pathValues_[i];
                }
            } else {
                Rest.log("No path params");
            }
            req.pathParam = function(param) {
                if(typeof req.pathParsed_[param] === "undefined") {
                    Rest.log("attempt to access undefined path parameter");
                    throw "Rest Service Error: attempt to access undefined path parameter";
                }
                return req.pathParsed_[param];
            }
            req.queryParam = function(param) {
                if(typeof req.uri.query === "undefined" || typeof req.uri.query[param] === "undefined") return null;
                return req.uri.query[param];
            }
            var r = {
                noContent: (function(res_) { return function() { resource.noContent(res_); }})(res),
                notFound: (function(res_) { return function(obj) { resource.notFound(res_, obj); }})(res),
                ok: (function(res_) { return function(obj) { resource.ok(res_, obj); }})(res)
            }
            resource.handle(req, r);
        }
    });
};
Rest.prototype.noContent = function(res) {
    res.sendHeader(204, {'Content-Type': 'application/javascript'});
    res.close();
}
Rest.prototype.notFound = function(res, obj) {
    res.sendHeader(404, {'Content-Type': 'application/javascript'});
    if(typeof obj === "undefined" || obj === null) obj = {message: "not found"};
    res.write(JSON.stringify(obj));
    res.close();
}
Rest.prototype.ok = function(res, obj) {
    res.sendHeader(200, {'Content-Type': 'application/javascript'});
    res.write(JSON.stringify(obj));
    res.close();
}
Rest.server = Rest.createServer();
