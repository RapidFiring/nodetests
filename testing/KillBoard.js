'use strict';

const evejsapi = require('evejsapi');
const restify = require('restify');
const packageJSON = require('./../package.json');

 
class KillBoard {
    constructor() {
        this._baseurl ='https://zkillboard.com'
        this._prePath = '/api/kills/';
        this._postPath = '/orderDirection/desc/limit/1/json/';
    }
    getKillData(path){
        return new Promise((resolve, reject) => {
            const client = restify.createClient({
                    url: this._baseurl,
                    userAgent: packageJSON.name + 'v' + packageJSON.version
            });
            client.get(path, (err, req) => {
                if (err) {
                    return reject(err);
                }
                req.on('result', (errResult, res) => {
                    if (errResult) {
                        return reject(errResult);
                    }
                    res.body = '';
                    res.setEncoding('utf8');
                    res.on('data', function (chunk) {
                        res.body += chunk;
                    });
                    res.on('end', function () {
                        resolve (JSON.parse(res.body));
                    });
                });
            });
        });
    }
    getLastKillByCharId(id) {
        return new Promise((resolve, reject) => {
            let self = this;
            let _path = this._prePath + 'characterID/' + id + this._postPath;
            return self.getKillData(_path)
                .then(resolve)
                .catch(reject);
        });
    }
    getLastKillByCorpId(id) {
        return new Promise((resolve, reject) => {
            let self = this;
            let _path = this._prePath + 'corporationID/' + id + this._postPath;
            return self.getKillData(_path)
                .then(resolve)
                .catch(reject);
        });
    }
    getLastKillByAllyId(id) {
        return new Promise((resolve, reject) => {
            let self = this;
            let _path = this._prePath + 'allianceID/' + id + this._postPath;
            return self.getKillData(_path)
                .then(resolve)
                .catch(reject);
        });
    }
}
module.exports = KillBoard;