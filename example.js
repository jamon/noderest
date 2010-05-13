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
        sys.log("pathparam id: ")
        sys.log(req.pathParam("id"));
        var personId = parseInt(req.pathParam("id"));
        sys.log("requested person: " + personId);
        if(typeof people[personId] === "undefined") {
            resource.notFound();
        }
        resource.ok(people[personId]);
    });

rest
    .path("/person")
    .method("GET")
    .as(function(req, resource) {
        resource.ok(people);
    });

rest.start(8888);
