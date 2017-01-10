const backbone = require('backbone');
module.exports = backbone.Model.extend({
    idAttribute:'Id',
    parse: function (src) {
        var rv = _.fromPairs(src);

        rv.TimeMS = Math.floor(rv.Time / 60) + ':' + (rv.Time % 60 < 10 ? '0' : '') + (rv.Time % 60);
        return rv;
    }
});