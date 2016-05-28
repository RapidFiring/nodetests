'use strict';

const evejsapi = require('evejsapi');
const _ = require('lodash');
const chalk = require('chalk');
const util = require('util');

const CorpSheet = require('./CorporationSheet');

const KillBoard = require('./KillBoard');

const corpsheet = new CorpSheet();
const killBoard = new KillBoard();

const cache = new evejsapi.cache.redis();

const XmlClient = new evejsapi.client.xml({
  cache: cache
});

let currentDate = new Date(Date.now());
const checkDate = new Date(currentDate.setMonth(currentDate.getMonth() - 3));


function corpIsActive(id) {
  return new Promise((resolve, reject) => {
    corpsheet.getCorpById(id, XmlClient)
      .then((data) => {
        resolve(data.memberCount > 0);
      })
      .catch(reject(false));
  });
}

function checkContactActivity(value) {
  return new Promise((resolve, reject) => {
    if (value.labelMask == '1' || value.labelMask == '2' || value.labelMask == '8' || value.labelMask == '512') {
      switch (value.contactTypeID) {
        case '2':
          corpIsActive(value.contactID)
            .then((isActive)=> {
              if (isActive) {
                killBoard.getLastKillByCorpId(value.contactID, cache)
                  .then((data) => {
                    if (data.length) {
                      const killDate = new Date(data[0].killTime);
                      resolve(killDate.getTime() < checkDate.getTime());
                    } else {
                      resolve(true);
                    }
                  })
                  .catch(reject);
              }
            })
            .catch(reject(false));
          break;
        case '16159':
          killBoard.getLastKillByAllyId(value.contactID, cache)
            .then((data) => {
              if (data.length) {
                const killDate = new Date(data[0].killTime);
                resolve(killDate.getTime() < checkDate.getTime());
              } else {
                resolve(true);
              }
            })
            .catch(reject);
          break;
        case '1373':
        case '1374':
        case '1375':
        case '1376':
        case '1377':
        case '1378':
        case '1379':
        case '1380':
        case '1381':
        case '1382':
        case '1383':
        case '1384':
        case '1385':
        case '1386':
          killBoard.getLastKillByCharId(value.contactID, cache)
            .then((data) => {
              if (data.length) {
                let killDate = new Date(data[0].killTime);
                resolve(killDate.getTime() < checkDate.getTime());
              } else {
                resolve(true);
              }
            })
            .catch(reject);
          break;
        default:
          break;
      }
    } else {
      reject(new Error('labelMask mismatch ' + value.labelMask));
    }
  });
}

let printCorps = {
  1: {
    name: 'KOS-Alliances',
    data: []
  },
  2: {
    name: 'KOS-Corporations',
    data: []
  },
  8: {
    name: '1-Spieler-KOS-Corps.',
    data: []
  },
  512: {
    name: 'HotDropper NPC-Corp',
    data: []
  }
};

let cachedUntil;

XmlClient.fetch('corp:ContactList', {
  keyID: '2924405',
  vCode: 'zd6XGV82MfiFs9KsIVUzjiXHmzNIvvA5AruDKGOfhltaQjKtO1LTX2UdiHNgob9X'
})
  .then((data) => {
    let acList = _.orderBy(data.allianceContactList, ['labelMask']);
    let countList = _.size(acList);
    cachedUntil = data.cachedUntil;

    console.log('verarbeitung startet!');

    acList.reduce((previousValue, currentValue, index) => {

      return previousValue
        .then((memo) => {
          console.log('number', (index + 1) , '/', countList);
          return checkContactActivity(currentValue, XmlClient)
            .then((checkThis) => {
              if (checkThis) {
                memo[currentValue.labelMask].data.push(currentValue);
              }

              return memo;
            })
            .catch((err) => {
              // console.error('catch', err);
              return memo;
            });
        })
        .catch((err) => {
          console.error('catch', err);
        });

    }, Promise.resolve(printCorps))
      .then((complete) => {

        _.forEach(complete, (label) => {
          console.log(chalk.green(label.name));
          let count = 1;
          const sortCorps = _.orderBy(label.data, ['contactName']);
          let sizeCorps = _.size(sortCorps);
          console.log('label verarbeitet!' + sizeCorps);
          if (sizeCorps > 0) {
            _.forEach(sortCorps, (corp) => {
              console.log(count + "\t[" + corp.contactTypeID + "]\t[" + corp.standing + "]\t(" + corp.contactID + ")\t" + corp.contactName);
              count++;
            });
          } else {
            console.log('Es wurden keine Daten gefunden! ' + sizeCorps);
          }
        });
        console.log(chalk.green('cachedUntil: ' + cachedUntil + ' ET'));

        XmlClient.getCache().disconnect();
      });
  })
  .catch((err) => {
    console.error(err);
    XmlClient.getCache().disconnect();
  });
