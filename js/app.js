const ipc = require('electron').ipcRenderer;
const _ = require('lodash');
const util = require('util');
const backbone = require('backbone');
const $=require('jquery');
const config = require('../js/config');

backbone.$ = require('jquery');

let currentView = null;
let views = {};

_.each(document.querySelectorAll('.mode-bar button'), btn => {
    btn.addEventListener('click', function (ev) {
        var t = $(ev.target);
        if (!t.is('button')) t = t.closest('button');
        var newViewName = t.data('view');
        $('.mode-bar button').removeClass('active');
        t.addClass('active');
        if (!views[newViewName]) {
            var viewClass = require('../js/' + newViewName);
            views[newViewName] = new viewClass();
        }
        if (currentView == views[newViewName])
            return;
        config.patchConfig({ startingMode: newViewName });
        let showNew = () => {
            currentView = views[newViewName];
            _.each(document.getElementsByClassName('mode-content')[0].childNodes, n => document.getElementsByClassName('mode-content')[0].removeChild(n));
            currentView.trigger('showing');
            document.getElementsByClassName('mode-content')[0].appendChild(currentView.el);
            _.defer(() => currentView.trigger('show'));
        };
        if (currentView)
            currentView.trigger('hide').once('hidden', showNew);
        else
            showNew();
    });
});
ipc.send('interface-ready');
ipc.on('mpd-ready', (event, b, c) => {
    $('.status').text("Connected!");
});
ipc.on('mpd-error', (event, b, c) => {
    $('.status').text("Error!");
});
ipc.on('mpd-update', (event, system) => {
    $('.status').text("Update!");
});
let callbacks = {};
let cmds={};
ipc.on('mpd-command-response', (event, err, data, reqId) => {
    /*if(cmds[reqId].command!='status')
        console.log('CMD',cmds[reqId].command,cmds[reqId].args,'->', err, data);*/
    callbacks[reqId](event, err, data);
    delete callbacks[reqId];
    delete cmds[reqId];
});
window.mpdCommand = function (command, args) {
    return new Promise((resolve, reject) => {
        let reqId = 'rq_' + Math.random();
        callbacks[reqId] = function (event, err, data) {
            resolve({ err: err, data: data });
        };
        cmds[reqId]={command:command,args:args};
        /*if(command!='status')
            console.log('SND', reqId, command, args);*/
        ipc.send('mpd-command', command, args || [], reqId);
    });
};
window.formatResponse=function(data){
    return _.map((data||'').split('\n'), kv => _.each(kv.split(': '), v => {return v.trim();}));
};
config.getConfig().then(config=>{
    $('.mode-bar button[data-view='+(config.startingMode||'nowPlaying')+']').click();
});