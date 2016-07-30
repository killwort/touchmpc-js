const backbone = require('backbone');
const ipc = require('electron').ipcRenderer;
const artFetcher=require('../js/artFetcher');
module.exports = backbone.View.extend({
    events:{
        'click .command-repeat':'toggleRepeat',
        'click .command-shuffle':'toggleShuffle',
        'click .command-previous':'playPrevious',
        'click .command-stop':'playStop',
        'click .command-play':'playPlay',
        'click .command-next':'playNext'
    },
    className:'nowPlaying',
    initialize: function () {
        this.render();
        this.on('mpd-update', this.update);
        this.on('showing', this.show);
        this.on('hiding', this.hide);
        $(window).on('resize',_.bind(this.fixLayout,this));
        this.playlistModel = new (require('../js/playlistModel'))();
        this.playlistModel.fetch();
        this.artFetchCache = {};
    },
    fixLayout: function(){
        var w=$(window).width();
        var h=$(window).height();
        this.$el.toggleClass('layout-h',w>h);
        this.$el.toggleClass('layout-v',w<h);
    },
    render: function () {
        backbone.$.get('nowPlaying.html').then(data => this.el.innerHTML = data);
        this.fixLayout();
    },
    show: function () {
        this.update();
        this.__updater = setInterval(() => this.update(), 500);
    },
    hide: function () {
        clearInterval(this.___updater);
        this.el.className = 'hiding';
        this.once('transitionend webkitTransitionEnd oTransitionEnd MSTransitionEnd', () => {
            this.el.className = 'hidden';
            this.trigger('hidden');
        });
    },
    toggleRepeat:function(){
        if(this.$('.command-repeat').is('.active'))
            mpdCommand('repeat 0');
        else
            mpdCommand('repeat 1');
    },
    toggleShuffle:function(){
        if(this.$('.command-shuffler').is('.active'))
            mpdCommand('random 0');
        else
            mpdCommand('random 1');
    },
    playNext: function() {
        mpdCommand('next');
    },
    playPrevious: function() {
        mpdCommand('previous');
    },
    playStop: function() {
        mpdCommand('stop');
    },
    playPlay: function() {
        mpdCommand('play');
    },
    update: function () {
        var that = this;
        mpdCommand('status').then(function (response) {
            var status = _.fromPairs(formatResponse(response.data));
            if (status.songid)
                status.songModel = that.playlistModel.get(status.songid);
            if (status.nextsongid)
                status.nextSongModel = that.playlistModel.get(status.nextsongid);
            var timeParts = status.time ? status.time.split(':') : [];
            var cacheKey = status.songModel ? status.songModel.get('Artist') + '|' + status.songModel.get('Album') : status.songid;
            if (!that.artFetchCache[cacheKey]) {
                let obj = that.artFetchCache[cacheKey] = {
                    art: null
                };
                artFetcher.fetchArt(status.songModel.get('Artist'), status.songModel.get('Album')).then(url => obj.art = url);
            } else {
                status.art = that.artFetchCache[cacheKey].art;
            }
            status.percent = timeParts.length == 2 ? (timeParts[0] * 100 / timeParts[1]) + '%' : 0;
            _.each(that.$('[data-attr]'), elem => {
                let value = status;
                elem = backbone.$(elem);
                var path = elem.data('attr').split('.');
                for (var i = 0; i < path.length && !!value; i++) {
                    if (_.isFunction(value.get))
                        value = value.get(path[i]);
                    else
                        value = value[path[i]];
                }
                if (elem.data('css-property'))
                    elem.css(elem.data('css-property'), value);
                else if (elem.data('css-class'))
                    elem.toggleClass(elem.data('css-class'),value==(elem.data('true-value')||1));
                else if (elem.data('attribute')){
                    if(elem.attr(elem.data('attribute'))!=value)
                        elem.attr(elem.data('attribute'), value);
                }else
                    elem.text(value);

            });
        });
    }
});