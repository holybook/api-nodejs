var express = require('express');
var elasticsearch = require('elasticsearch');
var _ = require('lodash');

var app = express();
var client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'trace'
});

var onESError = (res) => (err) => {
    if (err.status == 404) {
        res.status(404).send();
    } else {
        res.status(500).send('ES - ' + err);
    }
};

var extract = a => {
    var result = a._source;
    result.id = a._id;
    return result;
};

var resource = (name, filters, opts) => {

    if (_.isUndefined(filters)) {
        filters = [];
    }

    app.get('/' + name, (req, res) => {

        var filterQuery = _.mapKeys(_.pick(req.query, _.keys(filters)), (value, key) => filters[key]);
        var termFilter = {};

        if (!_.isEmpty(filterQuery)) {
            console.log(filterQuery);
            termFilter = {
                term: filterQuery
            };
        }

        client.search(_.merge({
            index: 'meta',
            type: name,
            filterPath: ['hits.hits._source', 'hits.hits._id'],
            size: req.query.size || 25,
            from: req.query.from || 0,
            body: {
                query: {
                    filtered: {
                        query: {
                            match_all: {}
                        },
                        filter: termFilter
                    }
                }
            }
        }, opts)).then((o) => {
            res.send(o.hits.hits.map(extract));
        }, onESError(res));
    });

    app.get('/' + name + '/:id', (req, res) => {
        client.get({
            index: 'meta',
            type: name,
            id: req.params.id
        }).then((o) => {
            res.send(extract(o));
        }, onESError(res))
    });
};

resource('author', ['religion'], {
    sort: [ 'title.raw', 'name.raw' ]
});
resource('religion', [], {
    sort: [ 'name.raw' ]
});
resource('book', {
    religion: 'religion.id',
    author: 'author.id'
}, {
    _source_exclude: 'sections',
    sort: [ 'title.raw' ]
});

app.use(function (err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }
    console.log(err.stack);
    res.status(500);
    res.send({error: err});
});

var server = app.listen(3000, () => {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Server started on http://%s:%s", host, port);
});
