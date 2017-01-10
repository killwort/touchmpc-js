const aa = require('album-art');
const fs = require('fs');
const request = require('request');
const path = require('path');
const sanitize = require("sanitize-filename");
const mkdirp = require("mkdirp");
const cacheRoot = path.join(process.env.HOME || process.env.USERPROFILE, '.touchmpc-js', 'albumart');
const _ = require('lodash');
const $ = require('backbone').$;
let fetch = function (state) {
    return new Promise(function (resolve, reject) {
        aa(state.artist, state.album, 'extralarge', (err, url) => {
            if (err)
                reject(err);
            else if (!url)
                reject(false);
            else {
                state.url = url;
                resolve(state);
            }
        });
    });
};
let cached = function (state) {
    return new Promise(function (resolve, reject) {
        var cachedName = path.join(cacheRoot, sanitize(state.artist), sanitize(state.album) + '.img');
        if (fs.existsSync(cachedName)) {
            resolve(cachedName);
        } else
            reject(state);
    });
};
let cache = function (state) {
    return new Promise(function (resolve, reject) {
        var cachedName = path.join(cacheRoot, sanitize(state.artist), sanitize(state.album) + '.img');
        mkdirp(path.dirname(cachedName), function () {
            var strm=fs.createWriteStream(cachedName);
            strm.on('close',() => resolve(cachedName));
            request(state.url)
                .on('error', () => resolve(url))
                .pipe(strm);
        });
    });
};
let def = function() {
    return "../res/default-album-art.png";
};
let currentFetches = {};
let fetchArt = function(artist, album) {
    var key = artist + '|' + album;
    console.log('Requested', artist, album);
    if (currentFetches[key]) {
        return currentFetches[key];
    }
    return currentFetches[key] = cached({ artist, album })
        .then(null, state => fetch(state).then(cache, def))
        .then(data => {
            delete currentFetches[key];
            return data;
        });
};
module.exports = {
    fetchArt: fetchArt,
    fetchAll:function(elements, metadataSelector) {
        _.each(elements,
            elem => {
                var md = metadataSelector($(elem));
                fetchArt(md.artist, md.album)
                    .then(url => {
                        console.log('done', url);
                        var img = $('<img>');
                        img.attr('src', url);
                        $(elem).append(img);
                    });
            });
    }
};