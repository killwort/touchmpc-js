const backbone = require('backbone');
const ipc = require('electron').ipcRenderer;
const artFetcher=require('../js/artFetcher');
module.exports = backbone.View.extend({
    initialize: function () {
        this.render();
        this.on('mpd-update', this.update);
        this.on('showing', this.show);
        this.on('hiding', this.hide);
        this.playlistModel = new (require('../js/playlistModel'))();
        this.playlistModel.fetch();
        this.artFetchCache = {};
    },
    render: function () {
        backbone.$.get('nowPlaying.html').then(data => this.el.innerHTML = data);
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
                else if (elem.data('attribute')){
                    if(elem.attr(elem.data('attribute'))!=value)
                        elem.attr(elem.data('attribute'), value);
                }else
                    elem.text(value);

            });
        });
    }
});