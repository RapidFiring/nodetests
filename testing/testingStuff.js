'use strict';

const evejsapi = require('evejsapi');
const _ = require('lodash');
const chalk = require('chalk');
const KillBoard = require('./KillBoard');

const killBoard = new KillBoard(); 

console.log(killBoard);
console.log('bevor');
killBoard.getLastKillByCorpId('98270312')
    .then((data) => {
        let currentDate = new Date(Date.now());
        let checkDate = new Date(currentDate.setMonth(currentDate.getMonth() - 3));
        let killDate = new Date(data[0].killTime);
        console.log(data);
        console.log(data[0].killID + '\t' + (killDate.getTime() < checkDate.getTime()));
    });
console.log('after');    