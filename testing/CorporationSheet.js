'use strict';

class CorporationSheet {

  getCorpById(id, XmlClient) {
    return new Promise((resolve, reject) => {
      XmlClient.fetch('corp:CorporationSheet', {
        corporationID: id
      })
        .then(resolve)
        .catch(reject);
    });
  }

  getCorpByApiKey(keyId, vCode) {
    return new Promise((resolve, reject) => {
      this._XmlClient.fetch('corp:CorporationSheet',{
        keyID: keyId,
        vCode: vCode
      })
        .then(resolve)
        .catch(reject);
    });
  }
}
module.exports = CorporationSheet;
