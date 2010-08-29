var rest = require('./lib/rest');
var sys = require('sys');
var people = [
        {id: 0, name: "Adam Williams"},
        {id: 1, name: "Brian Smith"},
        {id: 2, name: "Kate Bowers"}
    ];

// resources
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

// list of references to resources
rest
    .path("/person_ref")
    .method("GET")
    .as(function(req, resource) {
        resource.ref(people, 'id', '/person/{id}');
    });

// list of resources
rest
    .path("/person")
    .method("GET")
    .as(function(req, resource) {
        resource.ok(people);
    });

rest.start(8088);
