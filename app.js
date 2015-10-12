var express = require('express');
var elasticsearch = require('elasticsearch');

var app = express();
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace'
});

app.get('/author', (req, res) => {
    client.search({
        index: 'meta',
        type: 'author',
        filterPath: 'hits.hits._source',
        size: 9999,
        body: {
            "query": {
                "match_all": {}
            }
        }
    }).then((o) => {
        res.send(o.hits.hits.map(a => a._source));
    }, function(err) {
        res.status(500).send('ES - ' + err);
    });
});

var server = app.listen(3000, () => {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Server started on http://%s:%s", host, port);
});
