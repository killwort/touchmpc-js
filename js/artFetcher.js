const aa = require('album-art');
const fs = require('fs');
const request = require('request');
const path = require('path');
const sanitize = require("sanitize-filename");
const mkdirp = require("mkdirp");
const cacheRoot = path.join(process.env.HOME || process.env.USERPROFILE, '.touchmpc-js', 'albumart');

let fetch = function (state) {
    return new Promise(function (resolve, reject) {
        console.log('fetching art for', state);
        aa(state.artist, state.album, 'extralarge', (err, url) => {
            if (err)
                reject(err);
            state.url = url;
            resolve(state);
        });
    });
};
let cached = function (state) {
    return new Promise(function (resolve, reject) {
        var cachedName = path.join(cacheRoot, sanitize(state.artist), sanitize(state.album) + '.img');
        if (fs.existsSync(cachedName)) {
            console.log('returned cached art for', state);
            resolve(cachedName);
        } else
            reject(state);
    });
};
let cache = function (state) {
    return new Promise(function (resolve, reject) {
        var cachedName = path.join(cacheRoot, sanitize(state.artist), sanitize(state.album) + '.img');
        console.log('caching art for', state);
        mkdirp(path.dirname(cachedName), function () {
            var strm=fs.createWriteStream(cachedName);
            strm.on('close',() => resolve(cachedName));
            request(state.url)
                .on('error', () => resolve(url))
                .pipe(strm);
        });
    });
};

module.exports = {
    fetchArt: function (artist, album) {
        return cached({ artist, album }).then(null, state => fetch(state).then(cache));
    }
};