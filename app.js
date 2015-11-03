var app = require('./src/express');
var cors = require('cors');
var _ = require('lodash');

app.use(cors({
    origin: 'http://localhost:3000'
}));

require('./src/api/meta');
require('./src/api/book');
require('./src/api/search');

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
