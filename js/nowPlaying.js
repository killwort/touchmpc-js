const backbone = require('backbone');
const $ = backbone.$;
module.exports = backbone.View.extend(_.extend({
    events:{
        'click .command-repeat':'toggleRepeat',
        'click .command-shuffle':'toggleShuffle',
        'click .command-previous':'playPrevious',
        'click .command-stop':'playStop',
        'click .command-play':'playPlay',
        'click .command-next':'playNext'
    },
    className:'nowPlaying animated-mode',
    initialize: function () {
        this.render();
        this.on('mpd-update', this.update);
        this.on('showing', this.show);
        this.on('hide', this.hide);
        this.on('show', this.fixLayout);

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
        $.get('nowPlaying.html').then(data => this.el.innerHTML = data);
        this.fixLayout();
    },
    show: function () {
        this.update();
        this.__updater = setInterval(() => this.update(), 500);
        $(this.el).removeClass('hidden hiding').addClass('showing');
    },
    hide: function () {
        clearInterval(this.___updater);
        $(this.el).one('transitionend webkitTransitionEnd',() => {
                    $(this.el).removeClass('hiding').addClass('hidden');
                    this.trigger('hidden');
                });
        $(this.el).removeClass('hidden').addClass('hiding');
    }
}, require('../js/playbackMixin.js')));