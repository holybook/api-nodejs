var express = require('express');
var elasticsearch = require('elasticsearch');

var app = express();
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace'
});

app.get('/author', function(req, res) {
    client.search({
        index: 'en',
        type: 'author',
        body: {
            "query": {
                "match_all": {}
            }
        }
    }).then(function (o) {
        res.send(o.hits.hits.map(a => a._source));
    });
});

var server = app.listen(3000, function() {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Server started on http://%s:%s", host, port);
});
