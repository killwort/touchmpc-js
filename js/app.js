const ipc = require('electron').ipcRenderer;
const _ = require('lodash');
const util = require('util');
const backbone = require('backbone');
backbone.$ = require('jquery');

let currentView = null;
let views = {};

_.each(document.querySelectorAll('.mode-bar button'), btn => {
    btn.addEventListener('click', function (ev) {
        var newViewName = ev.target.className;

        if (!views[newViewName]) {
            var viewClass = require('../js/' + newViewName);
            console.log(viewClass);
            views[newViewName] = new viewClass();
        }
        if (currentView == views[newViewName])
            return;
        let showNew = () => {
            currentView = views[newViewName];
            _.each(document.getElementsByClassName('mode-content')[0].childNodes, n => document.getElementsByClassName('mode-content')[0].removeChild(n));
            currentView.trigger('showing');
            document.getElementsByClassName('mode-content')[0].appendChild(currentView.el);
            currentView.trigger('show');
        };
        if (currentView)
            currentView.trigger('hide').once('hidden', showNew);
        else
            showNew();
    });
});
ipc.send('interface-ready');
ipc.on('mpd-ready', (event, b, c) => {
    console.log("We're connected!");
    document.getElementsByClassName('status')[0].innerHTML = "Connected!";
});
ipc.on('mpd-error', (event, b, c) => {
    console.log("Error connecting");
    document.getElementsByClassName('status')[0].innerHTML = "Error!";
});
ipc.on('mpd-update', (event, system) => {
    if (currentView) currentView.trigger('mpd-update', system);
    document.getElementsByClassName('status')[0].innerHTML = "Update!";
});
let callbacks = {};
ipc.on('mpd-command-response', (event, err, data, reqId) => {
    //console.log('RCV', reqId, event, err, data);
    callbacks[reqId](event, err, data);
    delete callbacks[reqId];
});
window.mpdCommand = function (command, args) {
    return new Promise((resolve, reject) => {
        let reqId = 'rq_' + Math.random();
        callbacks[reqId] = function (event, err, data) {
            resolve({ err: err, data: data });
        };
        //console.log('SND', reqId, command, args);
        ipc.send('mpd-command', command, args || [], reqId);
    });
};
window.formatResponse=function(data){
    return _.map(data.split('\n'), kv => _.each(kv.split(': '), v => {return v.trim();}));
};