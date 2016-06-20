'use strict';

const evejsapi = require('evejsapi');
const _ = require('lodash');
const chalk = require('chalk');

const XmlClient = new evejsapi.client.xml({
  cache: new evejsapi.cache.redis({
    host: 'localhost',
    port: 6379,
    prefix: 'evejsapi.cache'
  }),
});
XmlClient.setParams({
  keyID: 'EVE-API-KEYID',
  vCode: 'EVE-API-VCODE'
});

XmlClient.fetch('corp:IndustryJobs')
  .then((data) => {
    const jobs = _.orderBy(data.jobs, ['endDate']);
    let cachedUntil = data.cachedUntil;
    let printJobs = {
      1: {
        name: 'Production',
        data: []
      },
      3: {
        name: 'TE',
        data: []
      },
      4: {
        name: 'ME',
        data: []
      },
      5: {
        name: 'Copy',
        data: []
      },
      8: {
        name: 'Invention',
        data: []
      }
    };
    _.forEach(jobs, function(value) {
      printJobs[value.activityID].data.push(value);
    });

    _.forEach(printJobs, (jobs) => {
      console.log(chalk.green(jobs.name));
      let count = 1;
      const sortJobs = _.orderBy(jobs.data, ['endData']);
      _.forEach(sortJobs, (value) => {
        console.log(count+'\t'+value.endDate+'\t'+value.solarSystemName+'\t'+value.licensedRuns+'\t'+
          value.installerName+'\t'+value.productTypeName);
        count++;
      });
    });
    console.log(chalk.green('cachedUntil: ' + cachedUntil + ' ET'));
  })
  .catch(console.error);
