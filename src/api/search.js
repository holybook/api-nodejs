var app = require('../express');
var es = require('../elasticsearch');

app.get('/search', (req, res) => {
    es.client.search({
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
            results: o.hits.hits.map(es.extractWithHighlight)
        });
    }, es.onError(res));
});
