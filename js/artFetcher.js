const aa = require('album-art');
const fs = require('fs');
const request = require('request');
const path = require('path');
const sanitize = require("sanitize-filename");
const mkdirp = require("mkdirp");
const cacheRoot = path.join(process.env.HOME || process.env.USERPROFILE, '.touchmpc-js', 'albumart');

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
module.exports = {
    fetchArt: function (artist, album) {
        return cached({ artist, album }).then(null, state => fetch(state).then(cache,def));
    }
};