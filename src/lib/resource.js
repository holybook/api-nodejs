var app = require('../express');
var _ = require('lodash');
var es = require('../elasticsearch');
var cons = require('../constants');

module.exports = (name, filters, opts) => {

    if (_.isUndefined(filters)) {
        filters = [];
    }

    app.get('/api/' + name, (req, res) => {

        var filterQuery = _.mapKeys(_.pick(req.query, _.keys(filters)), (value, key) => filters[key]);
        var termFilter = {};

        if (!_.isEmpty(filterQuery)) {
            console.log(filterQuery);
            termFilter = {
                term: filterQuery
            };
        }

        es.client.search(_.merge({
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
            var results = (o.hits) ? o.hits.hits.map(es.extract) : [];

            res.append(cons.HEADER_PAGINATION_TOTAL, o.hits.total);
            res.append('Access-Control-Expose-Headers', cons.HEADER_PAGINATION_TOTAL);
            res.send(results);

        }, es.onError(res));
    });

    app.get('/api/' + name + '/:id', (req, res) => {
        es.client.get({
            index: 'meta',
            type: name,
            id: req.params.id
        }).then((o) => {
            res.send(es.extract(o));
        }, es.onError(res))
    });
};