const mkdirp = require("mkdirp");
const fs = require('fs');
const path = require('path');
const configFile = path.join(process.env.HOME || process.env.USERPROFILE, '.touchmpc-js', 'config.json');

module.exports = {
    getConfig: function () {
        return new Promise((resolve, reject) => {
            mkdirp(path.dirname(configFile), function () {
                if (!fs.existsSync(configFile)) {
                    var defaults = {
                        mpd: {
                            port: 6600,
                            host: 'localhost'
                        },
                        startingMode:'nowPlaying'
                    };
                    fs.writeFileSync(configFile, JSON.stringify(defaults), 'utf8');
                    resolve(defaults);
                } else
                    resolve(JSON.parse(fs.readFileSync(configFile, 'utf8')));
            });
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