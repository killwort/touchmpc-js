const backbone = require('backbone');
const $=backbone.$;
const _ = require('lodash');
const artFetcher = require('../js/artFetcher');
const ds=require('dragscroll');
const ipc = require('electron').ipcRenderer;

module.exports = backbone.View.extend(_.extend({
    events: {
        'click tr.item': 'toggleItemSelection',
        'click .command-repeat': 'toggleRepeat',
        'click .command-shuffle': 'toggleShuffle',
        'click .command-previous': 'playPrevious',
        'click .command-stop': 'playStop',
        'click .command-play': 'playPlay',
        'click .command-next': 'playNext',
        'click .command-queue': 'queueSelected',
        'click .command-remove': 'removeSelected'
    },
    className: 'playlist animated-mode',
    initialize:function() {
        backbone.$.get('playlist.html').then(data => this.el.innerHTML = data);
        this.on('hide',this.hide);
        this.on('showing', this.show);
        ipc.on('mpd-update', _.bind(this.update, this));

        this.playlistModel = new (require('../js/playlistModel'))();
        this.playlistModel.on('fetched', _.bind(this.render, this));
        this.playlistModel.fetch();//.then(_.bind(this.render, this));
        this.artFetchCache = {};
    },
    render:function() {
        backbone.$.get('playlistItems.html')
            .then(data => {
                artFetcher.fetchAll(this.$('.playlist-items').html(_.template(data)(this.playlistModel)).find('.album-art'),node=> { return { artist: node.data('artist'), album: node.data('album') }; });
            });
    },
    show: function () {
        this.update();
        this.__updater = setInterval(() => this.update(), 500);

        $(this.el).removeClass('hidden hiding').addClass('showing');
        _.delay(() => ds.reset(),150);
    },
    hide: function () {
        clearInterval(this.___updater);

        $(this.el).one('transitionend webkitTransitionEnd', () => {
            $(this.el).removeClass('hiding').addClass('hidden');
            this.trigger('hidden');
        });
        $(this.el).removeClass('hidden').addClass('hiding');
    },
    toggleItemSelection:function(ev) {
        var t = $(ev.target);
        if (!t.is('.item')) t = t.closest('.item');
        t.toggleClass('selected');
    },
    queueSelected:function() {
        _.each($(this.el).find('.item.selected').removeClass('selected'), elem => {
            mpdCommand('prioid 1 '+$(elem).data('id'));
        });
    },
    removeSelected: function () {
        _.each($(this.el).find('.item.selected').remove(),elem => {
            mpdCommand('deleteid '+$(elem).data('id'));
        });
    },
    updateMore: function (status, subsystem) {
        var newCurrent = status.songModel
            ? $(this.el).find('.item[data-id=' + status.songModel.get('Id') + ']')
            : $('<div>');
        if (newCurrent.is('.current')) return;
        $(this.el).find('.item.current').removeClass('current');
        newCurrent.addClass('current');
        if (newCurrent.length) newCurrent.get(0).scrollIntoView();
    }
}, require('../js/playbackMixin.js')));
