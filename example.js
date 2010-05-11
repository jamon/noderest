var rest = require('./lib/rest');

rest
    .path("/person/{id}")
    .method("GET")
    .as(function(req) {
        return {
            id: parseInt(req.pathParam("id")),
            name: req.queryParam("name")
        };
});
