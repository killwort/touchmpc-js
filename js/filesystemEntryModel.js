const backbone = require('backbone');
module.exports = backbone.Model.extend({
    parse: function (src) {
        var rv = _.fromPairs(src);
        _.each(['file', 'playlist', 'directory', 'parent'],
            ent => {
                if (rv[ent]) {
                    rv.Type = ent;
                    rv.Name = rv[ent];
                    delete rv[ent];
                }
            });
        rv.FullPath = rv.Name;
        rv.Name = rv.Name.replace(/^.*\/([^/]+)$/, '$1');
        return rv;
    }
});