var express = require('express');
var elasticsearch = require('elasticsearch');
var cors = require('cors')
var _ = require('lodash');


var HEADER_PAGINATION_TOTAL = 'pagination-total';


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

var extract = (a) => {
    var result = a._source;
    result.id = a._id;
    return result;
};

var extractSearchResult = (a) => {
    var result = extract(a);
    result.body = a.highlight.text[0];
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
            filterPath: ['hits.hits._source', 'hits.hits._id', 'hits.total'],
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
            if (o.hits) {
                res.append(HEADER_PAGINATION_TOTAL, o.hits.total);
                res.append('Access-Control-Expose-Headers', HEADER_PAGINATION_TOTAL);
                res.send(o.hits.hits.map(extract));
            } else {
                res.append(HEADER_PAGINATION_TOTAL, 0);
                res.append('Access-Control-Expose-Headers', HEADER_PAGINATION_TOTAL);
                res.send([]);
            }
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

app.use(cors({
    origin: 'http://localhost:3000'
}));

resource('author', ['religion'], {
    sort: ['title.raw', 'name.raw']
});
resource('religion', [], {
    sort: ['name.raw']
});
resource('book', {
    religion: 'religion.id',
    author: 'author.id'
}, {
    _source_exclude: 'sections',
    sort: ['title.raw']
});

var page = (paragraphs) => {
    var sections = [];
    var lastSection;

    var addParagraph = (p) => {
        if (!lastSection || lastSection.index != p.book.section.index) {
            // new section:
            lastSection = p.book.section;
            lastSection.text = [p.text];
            sections.push(lastSection);
        } else {
            lastSection.text.push(p.text);
        }
    };

    _.forEach(paragraphs, addParagraph);

    return sections;
};

app.get('/book/:id/text', (req, res) => {
    client.search({
        index: 'text-en',
        type: 'paragraph',
        filterPath: ['_scroll_id', 'hits.hits._source', 'hits.hits._id'],
        _source_exclude: 'author,religion,book.id,book.title',
        size: req.query.size || 25,
        from: req.query.from || 0,
        body: {
            query: {
                filtered: {
                    query: {
                        match_all: {}
                    },
                    filter: {
                        term: {
                            'book.id': req.params.id
                        }
                    }
                }
            }
        }
    }).then((o) => {
        res.send(page(o.hits.hits.map(extract)));
    }, onESError(res));
});

app.get('/search', (req, res) => {
    client.search({
        index: 'text-en',
        type: 'paragraph',
        //filterPath: ['_scroll_id', 'hits.hits._source', 'hits.hits._id'],
        //_source_exclude: 'author,religion,book.id,book.title',
        size: req.query.size || 25,
        from: req.query.from || 0,
        body: {
            query: {
                query_string: {
                    default_field: 'text',
                    query: req.query.q
                }
            },
            highlight : {
                pre_tags : ['<strong>'],
                post_tags : ['</strong>'],
                fields : {
                    text : {
                        fragment_size : 1000,
                        number_of_fragments : 1
                    }
                }
            }
        }
    }).then((o) => {
        res.send({
            hits: o.hits.total,
            took: o.took,
            results: o.hits.hits.map(extractSearchResult)
        });
    }, onESError(res));
});

app.use(function (err, req, res, next) {
    if (res.headersSent) {
        return next(err);
    }
    console.log(err.stack);
    res.status(500);
    res.send({error: err});
});

var server = app.listen(3030, () => {
    var host = server.address().address;
    var port = server.address().port;

    console.log("Server started on http://%s:%s", host, port);
});
