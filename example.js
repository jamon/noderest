var rest = require('./lib/rest');
var sys = require('sys');
var people = [
        {id: 0, name: "Adam Williams"},
        {id: 1, name: "Brian Smith"},
        {id: 2, name: "Kate Bowers"}
    ];
rest
    .path("/person/{id}")
    .method("GET")
    .as(function(req, resource) {
        var personId = parseInt(req.pathParam("id"));
        sys.log("incoming request for person id: " + personId);
        if(typeof people[personId] === "undefined") {
            resource.notFound();
        } else {
            resource.ok(people[personId]);
        }
    });

rest
    .path("/person")
    .method("GET")
    .as(function(req, resource) {
        resource.ok(people);
    });

rest.start(8888);
