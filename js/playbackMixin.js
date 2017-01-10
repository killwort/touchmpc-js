const artFetcher = require('../js/artFetcher');

module.exports = {
    toggleRepeat: function () {
        if (this.$('.command-repeat').is('.active'))
            mpdCommand('repeat 0');
        else
            mpdCommand('repeat 1');
    },
    toggleShuffle: function () {
        if (this.$('.command-shuffler').is('.active'))
            mpdCommand('random 0');
        else
            mpdCommand('random 1');
    },
    playNext: function () {
        mpdCommand('next');
    },
    playPrevious: function () {
        mpdCommand('previous');
    },
    playStop: function () {
        mpdCommand('stop');
    },
    playPlay: function () {
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
            if (status.songModel) {
                var ckey = status.songModel.get('Artist') + '|' + status.songModel.get('Album');

                status.art = that.artFetchCache[ckey] || '../res/loading-album-art.png';
                if (!that.artFetchCache[ckey])
                    artFetcher.fetchArt(status.songModel.get('Artist'), status.songModel.get('Album'))
                        .then(url => {
                            that.artFetchCache[ckey] = url;
                        }
                        );
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
                if (elem.data('css-property')) {
                    elem.css(elem.data('css-property'), elem.data('value-expression') ? eval(elem.data('value-expression')) : value);
                } else if (elem.data('css-class')) {
                    elem.toggleClass(elem.data('css-class'), value == (elem.data('true-value') || 1));
                } else if (elem.data('attribute')) {
                    if (elem.attr(elem.data('attribute')) != value)
                        elem.attr(elem.data('attribute'), value);
                } else
                    elem.text(value);

            });
            if (that.updateMore) that.updateMore(status);
        });
    }
};
