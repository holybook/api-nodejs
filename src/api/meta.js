var resource = require('../lib/resource');

resource('author', ['religion'], {
    sort: ['title.raw', 'name.raw']
});
resource('religion', [], {
    sort: ['name.raw']
});
