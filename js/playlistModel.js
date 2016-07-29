const backbone = require('backbone');
const songModel = require('../js/songModel');
module.exports = backbone.Collection.extend({
    modelId:function(attrs){
        return attrs['Id'];
    },
    fetch: function () {
        mpdCommand('playlistinfo').then(resp => {
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
        });
    }
});