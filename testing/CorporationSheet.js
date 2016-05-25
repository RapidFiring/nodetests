'use strict';

const evejsapi = require('evejsapi');
 
class CorporationSheet {
    constructor() {
        this._XmlClient = new evejsapi.client.xml({
            cache: new evejsapi.cache.redis({
                host: 'localhost',
                port: 6379,
                prefix: 'evejsapi.cache'
            }),
        });
    }
    getCorpById(id) {
        return new Promise((resolve, reject) => {
            this._XmlClient.setParams({
                corporationID: id
            });
            this._XmlClient.fetch('corp:CorporationSheet')
                .then(resolve)
                .catch (reject);
        });
    }
    getCorpByApiKey(keyId,vCode) {
        return new Promise((resolve, reject) => {
            this._XmlClient.setParams({
                keyID: keyId,
                vCode: vCode
            });
            this._XmlClient.fetch('corp:CorporationSheet')
                .then(resolve)
                .catch (reject);
        });        
    }   
}
module.exports = CorporationSheet;