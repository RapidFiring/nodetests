'use strict';

const restify = require('restify');
const packageJSON = require('./../package.json');


class KillBoard {
  constructor() {
    this._baseurl = 'https://zkillboard.com'
    this._prePath = '/api/kills/';
    this._postPath = '/orderDirection/desc/limit/1/json/';
  }

  getKillData(path, cache) {
    return new Promise((resolve, reject) => {

      cache
        .read(path)
        .then((data) => {
          if (data !== null) {
            return resolve(JSON.parse(data));
          }

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
                cache.write(path, res.body, 1800)
                  .then(() => {
                    resolve(JSON.parse(res.body));
                  });
              });
            });
          });
        })
        .catch((err) => {
          console.error('zkillboard fetch', err);
          reject(err);
        });

    });
  }

  getLastKillByCharId(id, cache) {
    return new Promise((resolve, reject) => {
      let self = this;
      let _path = this._prePath + 'characterID/' + id + this._postPath;
      return self.getKillData(_path, cache)
        .then(resolve)
        .catch(reject);
    });
  }

  getLastKillByCorpId(id, cache) {
    return new Promise((resolve, reject) => {
      let self = this;
      let _path = this._prePath + 'corporationID/' + id + this._postPath;
      return self.getKillData(_path, cache)
        .then(resolve)
        .catch(reject);
    });
  }

  getLastKillByAllyId(id, cache) {
    return new Promise((resolve, reject) => {
      let self = this;
      let _path = this._prePath + 'allianceID/' + id + this._postPath;
      return self.getKillData(_path, cache)
        .then(resolve)
        .catch(reject);
    });
  }
}
module.exports = KillBoard;
