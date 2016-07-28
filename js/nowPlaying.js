const backbone = require('backbone');
const ipc = require('electron').ipcRenderer;
module.exports = backbone.View.extend({
    initialize: function () {
        this.render();
        this.on('mpd-update', this.update);
        this.on('showing', this.show);
        this.on('hiding', this.hide);
        this.playlistModel = new (require('../js/playlistModel'))();
        this.playlistModel.fetch();
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
console.log(status,status.songid,that.playlistModel.get(status.songid));
/*            let disp = function (prefix, obj) {
                _.forEach(obj, (v, k) => {
                    that.$(prefix + k).text(v);
                    if (_.isObject(v)) {
                        if (_.isFunction(v.get) && _.isFunction(v.toJSON))
                            disp(prefix + k + '-', v.toJSON());
                        else
                            disp(prefix + k + '-', v);
                    }
                });
            };
            disp('.display-', status);*/
        });
    }
});