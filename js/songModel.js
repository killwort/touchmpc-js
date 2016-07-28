const backbone = require('backbone');
module.exports = backbone.Model.extend({
    idAttribute:'Id',
    parse: function (src) {
        return _.fromPairs(src);
    }
});