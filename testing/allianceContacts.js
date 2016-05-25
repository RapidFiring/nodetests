'use strict';


const evejsapi = require('evejsapi');
const _ = require('lodash');
const chalk = require('chalk');
const CorpSheet = require('./CorporationSheet');

const KillBoard = require('./KillBoard');

const corpsheet = new CorpSheet();
const killBoard = new KillBoard(); 

const XmlClient = new evejsapi.client.xml({
  cache: new evejsapi.cache.redis({
    host: 'localhost',
    port: 6379,
    prefix: 'evejsapi.cache'
  }),
});

let currentDate = new Date(Date.now());
const checkDate = new Date(currentDate.setMonth(currentDate.getMonth() - 3));


function corpIsActive(id) {
   return new Promise((resolve, reject) => {
       corpsheet.getCorpById(id)
       .then((data) => {
           resolve(data.memberCount > 0);
       })
       .catch(reject(false));
   });
}

function checkContactActivity(value) {
   return new Promise((resolve, reject) => {
        let isNotActive = false; 
        if (value.labelMask == '1' || value.labelMask == '2' || value.labelMask == '8'|| value.labelMask == '512')
        {                               
            switch (value.contactTypeID)
            {
                case '2':
                {
                    corpIsActive(value.contactID)
                    .then ((isActive)=> {
                        if(isActive)
                        {
                            killBoard.getLastKillByCorpId(value.contactID)
                                .then((data) => {
                                    let killDate = new Date(data[0].killTime);
                                    isNotActive = killDate.getTime() < checkDate.getTime(); 
                                })
                                .catch(reject(false));
                        }                       
                    })
                    .catch(reject(false));
                    break;
                }
                case '16159':
                {
                    killBoard.getLastKillByCorpId(value.contactID)
                        .then((data) => {
                            let killDate = new Date(data[0].killTime);
                            isNotActive = killDate.getTime() < checkDate.getTime(); 
                        })
                        .catch(reject(false));
                    break;
                }
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
                {
                    killBoard.getLastKillByCharId(value.contactID)
                        .then((data) => {
                            let killDate = new Date(data[0].killTime);
                            isNotActive = killDate.getTime() < checkDate.getTime(); 
                        })
                        .catch(reject(false));
                    break;
                }
                default:
                    break;
            }
            console.log(value.contactName + '\t IsActive: ' + !isNotActive);
        }       
        resolve(isNotActive);
   });
}

XmlClient.setParams({
  keyID: '2924405',
  vCode: 'zd6XGV82MfiFs9KsIVUzjiXHmzNIvvA5AruDKGOfhltaQjKtO1LTX2UdiHNgob9X'
});
XmlClient.fetch('corp:ContactList')
    .then((data) => {
        const acList = _.orderBy(data.allianceContactList, ['labelMask']);
        let cachedUntil = data.cachedUntil;
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
        
        console.log('verarbeitung startet!');

        _.forEach(acList, function(value) {
            checkContactActivity(value)
            .then((checkThis) => {
                console.log(checkThis);
                if(checkThis)
                    printCorps[value.labelMask].data.push(value); 
            });    
        });
        console.log('label verarbeitet!' + _.size(printCorps));
        if (_.size(printCorps) > 0)
        {
            _.forEach(printCorps, (label) => {
                console.log(chalk.green(label.name));
                let count = 1;
                const sortCorps = _.orderBy(label.data, ['contactName']);
                let sizeCorps =  _.size(sortCorps);
                console.log('label verarbeitet!' + _.size(sortCorps));
                if (sizeCorps > 0)
                {
                    _.forEach(sortCorps, (corp) => {
                        console.log(count+'\t['+corp.contactTypeID+']\t['+corp.standing+']\t('+corp.contactID+')\t'+corp.contactName);
                        count++;
                    });
                }
                else {
                    console.log('Es wurden keine Daten gefunden! ' + sizeCorps);
                }
            });
        }
        else {
            console.log('Es wurden keine Daten gefunden! ' + _.size(printCorps));
        }
      console.log(chalk.green('cachedUntil: ' + cachedUntil + ' ET'));
  })
  .catch(console.error);
