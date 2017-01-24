const backbone = require('backbone');
const $=backbone.$;
const _ = require('lodash');
const artFetcher = require('../js/artFetcher');

module.exports = backbone.View.extend({
    events: {
        'click': 'navigate',
        'click .command-add': 'add',
        'click .command-replace':'replace'
    },
    className: 'item',
    initialize:function() {
        backbone.$.get('filesystemItem.html').then(data => {
            this.el.innerHTML = _.template(data)(this.model);
            if (this.model.get('file')) {
                artFetcher.fetchAll(this.$('.album-art'),
                    node => { return { artist: node.data('artist'), album: node.data('album') }; });
            }
        });
        this.$el.addClass(this.model.get('Type'));
    },
    navigate: function () {
        this.model.get('Parent').cd(this.model);
    },
    add:function(ev) {
        ev.stopPropagation();
        this.model.get('Parent').addToCurrentPlaylist(this.model);
    },
    replace: function (ev) {
        ev.stopPropagation();
        this.model.get('Parent').replaceCurrentPlaylist(this.model);
    }
});
