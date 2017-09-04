#!/usr/bin/env node
const csv = require('fast-csv');
const moment = require('moment');

const output = [];

// sample generator
const users = ['5', '7', '9'];
const STARTDATE = moment.unix(1451606400);
for (var i = 0; i < 14; i++) {
  var date = STARTDATE.add(i, 'days');
  output.push([
    date.unix(),
    users[0],
  ]);
  if (i % 2 === 0) {
    output.push([
      date.unix(),
      users[1],
    ]);
  }
  if (i === 4) {
    output.push([
      date.unix(),
      users[2],
    ]);
  }
}

csv
  .writeToPath('sample.csv', output, { headers: false })
  .on('finish', () => console.log('done!'));
