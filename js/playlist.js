const backbone = require('backbone');
const $=backbone.$;
const ipc = require('electron').ipcRenderer;
const _ = require('lodash');
module.exports = backbone.View.extend({
    className: 'playlist animated-mode',
    initialize:function() {
        backbone.$.get('playlist.html').then(data => this.el.innerHTML = data);
        $(window).on('resize', _.bind(this.fixLayout, this));
        this.on('hide',this.hide);
        this.on('showing',this.show);
        this.playlistModel = new (require('../js/playlistModel'))();
        this.playlistModel.fetch().then(_.bind(this.render, this));
    },
    render:function() {
        backbone.$.get('playlistItems.html')
            .then(data => {
                this.$('.playlist-items').html(_.template(data)(this.playlistModel));
            });
        this.fixLayout();
    },
    fixLayout: function () {
        var mc = $('.mode-content');
        mc.find('.playlist-table.body').height(mc.height() - mc.find('.playlist-table.head').height());
    },
    show:function(){
        $(this.el).removeClass('hidden hiding').addClass('showing');
    },
    hide:function(){
        $(this.el).one('transitionend webkitTransitionEnd', () => {
            $(this.el).removeClass('hiding').addClass('hidden');
            this.trigger('hidden');
        });
        $(this.el).removeClass('hidden').addClass('hiding');
    
    }
});
