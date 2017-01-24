const backbone = require('backbone');
const songModel = require('../js/songModel');
const ipc = require('electron').ipcRenderer;
const _ = require('lodash');

module.exports = backbone.Collection.extend({
    initialize: function () {
        var that = this;
        ipc.on('mpd-update',
            (sender, system) => {
                if (system === 'playlist')
                    that.fetch();
            });
    },
    modelId:function(attrs){
        return attrs['Id'];
    },
    fetch: function () {
        return mpdCommand('playlistinfo').then(resp => {
            var props = formatResponse(resp.data);
            var lastStart = 0;
            var models=[];
            for (var i = 0; i < props.length; i++) {
                if (props[i][0] == 'file' && lastStart != i) {
                    models.push(new songModel(props.slice(lastStart, i),{parse:true}));
                    lastStart = i;
                }
            }
            models.push(new songModel(props.slice(lastStart, i),{parse:true}));
            this.reset(models);
            this.trigger('fetched');
        },err=>{
            console.log('Cannot fetch playlist',err);
        });
    }
});