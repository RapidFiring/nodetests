'use strict';

const evejsapi = require('evejsapi');
 
class AllianceList {
    constructor(versionId) {
        this.super(versionId);
        this._XmlClient = new evejsapi.client.xml({
            cache: new evejsapi.cache.redis({
                host: 'localhost',
                port: 6379,
                prefix: 'evejsapi.cache'
            }),
        });
        this._XmlClient.setParams({
             version: versionId
        });
        this._XmlClient.fetch('')
    }
    getAllianceById(id) {
        return new Promise((resolve, reject) => {
            this._XmlClient.setParams({
                corporationID: id
            });
            this._XmlClient.fetch('corp:CorporationSheet')
                .then((data) => {
                    resolve(data);                   
                })
                .catch ((err) => {
                    return reject(err);
                });
        });
    }
}
module.exports = CorporationSheet;