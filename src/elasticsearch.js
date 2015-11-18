var elasticsearch = require('elasticsearch');

exports.client = new elasticsearch.Client({
    host: 'localhost:9200',
    log: 'warning'
});

exports.onError = (res) => (err) => {
    if (err.status == 404) {
        res.status(404).send();
    } else {
        res.status(500).send('ES - ' + err);
    }
};

exports.extract = (a) => {
    var result = a._source;
    result.id = a._id;
    return result;
};

exports.extractWithHighlight = (a) => {
    var result = exports.extract(a);
    result.body = a.highlight.text[0];
    return result;
};