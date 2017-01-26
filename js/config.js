const mkdirp = require("mkdirp");
const fs = require('fs');
const _ = require('lodash');
const path = require('path');
const configFile = path.join(process.env.HOME || process.env.USERPROFILE, '.touchmpc-js', 'config.json');

let defaults = {
    mpd: {
        port: 6600,
        host: 'localhost'
    },
    startingMode: 'nowPlaying'
};
module.exports = {
    getConfig: function () {
        return new Promise((resolve, reject) => {
            mkdirp(path.dirname(configFile), function () {
                if (!fs.existsSync(configFile)) {
                    fs.writeFileSync(configFile, JSON.stringify(defaults), 'utf8');
                    resolve(defaults);
                } else {
                    try {
                        resolve(JSON.parse(fs.readFileSync(configFile, 'utf8')));
                    } catch (e) {
                        resolve(defaults);
                    }
                }
            });
        });
    },
    patchConfig:function(updates) {
        return this.getConfig()
            .then(cfg => {
                cfg = _.extend(cfg, updates);
                return this.saveConfig(cfg);
            });
    },
    saveConfig: function (config) {
        return new Promise((resolve, reject) => {
            mkdirp(path.dirname(configFile), function () {
                fs.writeFileSync(configFile, JSON.stringify(config), 'utf8');
                resolve();
            });
        });
    }
}