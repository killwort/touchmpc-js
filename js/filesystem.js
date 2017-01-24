const backbone = require('backbone');
const $=backbone.$;
const _ = require('lodash');
const filesystemItem = require('../js/filesystemItem');
const ds=require('dragscroll');
const ipc = require('electron').ipcRenderer;

module.exports = backbone.View.extend({
    events: {
        
    },
    className: 'filesystem animated-mode',
    initialize:function() {
        this.on('hide', this.hide);
        this.on('showing', this.show);
        backbone.$.get('filesystem.html')
            .then(data => {
                this.el.innerHTML = data;
                this.filesystemModel = new (require('../js/filesystemModel'))();
                this.filesystemModel.on('fetched', _.bind(this.render, this));
                this.filesystemModel.fetch(); 
                this.__controls = [];
            });
    },
    render:function() {
        var elem = this.$('.filesystem-items').empty();
        _.each(this.__controls, c => c.remove());
        this.__controls = [];
        _.each(this.filesystemModel.models,
            m => {
                var rm = new filesystemItem({ model: m });
                elem.append(rm.el);
                this.__controls.push(rm);
            });
    },
    show: function () {
        $(this.el).removeClass('hidden hiding').addClass('showing');
        _.delay(() => ds.reset(),150);
    },
    hide: function () {
        $(this.el).one('transitionend webkitTransitionEnd', () => {
            $(this.el).removeClass('hiding').addClass('hidden');
            this.trigger('hidden');
        });
        $(this.el).removeClass('hidden').addClass('hiding');
    }
});
