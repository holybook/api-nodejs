var app = require('../express');
var es = require('../elasticsearch');
var resource = require('../lib/resource');
var _ = require('lodash');

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
            lastSection.offset = p.index - lastSection.start;
            sections.push(lastSection);
        } else {
            lastSection.text.push(p.text);
        }
    };

    _.forEach(paragraphs, addParagraph);

    return sections;
};

app.get('/api/book/:id/text', (req, res) => {
    es.client.search({
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
        res.send(page(o.hits.hits.map(es.extract)));
    }, es.onError(res));
});
