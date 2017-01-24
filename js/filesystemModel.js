const backbone = require('backbone');
const songModel = require('../js/songModel');
const filesystemEntryModel = require('../js/filesystemEntryModel');
const ipc = require('electron').ipcRenderer;
const _ = require('lodash');

module.exports = backbone.Collection.extend({
    initialize: function () {
        this._wd = '/';
    },
    modelId:function(attrs){
        return attrs['Id'];
    },
    cd: function (mdl) {
        if (mdl.get('Type') === 'directory') {
            if (this._wd[this._wd.length - 1] !== '/')
                this._wd += '/';
            this._wd += mdl.get('Name');
            this.fetch();
        } else if (mdl.get('Type') === 'parent') {
            this._wd = this._wd.replace(/\/+[^/]+\/*$/, '');
            if (!this._wd) this._wd = '/';
            this.fetch();
        }
    },
    addToCurrentPlaylist:function(mdl) {
        mpdCommand('add "' + mdl.get('FullPath') + '"');
    },
    replaceCurrentPlaylist:function(mdl) {
        mpdCommand('clear').then(function () { mpdCommand('add "' + mdl.get('FullPath') + '"'); });
    },
    fetch: function () {
        var createModel = (type, props) => {
            var rv;
            switch (type) {
                case 'directory':
                    rv = new filesystemEntryModel(props, { parse: true });
                    break;
                case 'playlist':
                    rv = new filesystemEntryModel(props, { parse: true });
                    break;
                case 'file':
                    default :
                    rv=new songModel(props, { parse: true });
                    break;
            }
            rv.set('ParentPath', this._wd);
            rv.set('Parent', this);
            return rv;
        };
        var xwd = this._wd;
        if (xwd.length > 1 && xwd[0] === '/') xwd = xwd.substring(1);
        return mpdCommand('lsinfo "' + xwd+'"').then(resp => {
            var props = formatResponse(resp.data);
            var lastStart = 0, lastType;
            var models = [];
            if (this._wd !== '/') {
                models.push(new filesystemEntryModel([['parent', '..'],['Parent',this]], { parse: true }));
            }
            for (var i = 0; i < props.length; i++) {
                if ((props[i][0] === 'directory' || props[i][0] === 'file' || props[i][0] === 'playlist')) {
                    if (lastStart !== i) {
                        models.push(createModel(lastType, props.slice(lastStart, i)));
                        lastStart = i;
                    }
                    lastType = props[i][0];
                }
            }
            if(lastType)
                models.push(createModel(lastType, props.slice(lastStart)));
            
            this.reset(models);
            this.trigger('fetched');
        },err=>{
            console.log('Cannot fetch playlist',err);
        });
    }
});