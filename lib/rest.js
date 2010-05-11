var http = require('http');
var sys = require('sys');
var url = require('url');  // url.parse(foo, true) -> href, search, query {var: val}, pathname
require('./underscore');

var rest = exports;

var resources = [];

var Rest = function() {
    resources.push(this);
};
Rest.regex = /\{(.*?)\}/g;

Rest.prototype.path = function(path) {
    this.keys_ = Rest.regex.exec(path).slice(1);
    this.regex_ = new RegExp(path.replace(Rest.regex, "([^\/]+)"));
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
Rest.prototype.handle = function(req) {
    sys.log("resource is handling request");
    return this.as_(req);
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
}

var server = http.createServer(function(req, res) {
    req.uri = url.parse(req.url, true);
    sys.log("request to " + req.uri.pathname);
    var resource = _(resources).chain()
        .select(
            function(o) {
                return req.uri.pathname.match(o.regex_) && req.method === o.method_;
            })
        .first()
        .value();
    if(_.isEmpty(resource)) {
        res.sendHeader(404, {'Content-Type': 'application/javascript'});
        res.write(JSON.stringify({message: "not found"}));
        res.close();
    } else {
        req.pathValues_ = resource.regex_.exec(req.uri.pathname).slice(1);
        req.pathParsed_ = {};
        for(var i = 0; i < resource.keys_.length; i++) {
            req.pathParsed_[resource.keys_[i]] = req.pathValues_[i];
        }
        req.pathParam = function(param) {
            return req.pathParsed_[param];
        }
        req.queryParam = function(param) {
            return req.uri.query[param];
        }
        res.sendHeader(200, {'Content-Type': 'application/javascript'});
        res.write(JSON.stringify(resource.handle(req)));
        res.close();
    }
}).listen(8888);
