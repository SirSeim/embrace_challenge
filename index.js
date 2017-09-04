#!/usr/bin/env node
const argv = require('yargs') // eslint-disable-line prefer-destructuring
  .usage('Usage: $0 <file> [options]')
  .describe('v', 'Show Info')
  .describe('vv', 'Show Info & Debug')
  .help('h')
  .demandCommand(1)
  .count('verbose')
  .alias('v', 'verbose')
  .argv;
const csv = require('fast-csv');
const moment = require('moment');

const VERBOSE_LEVEL = argv.verbose;
const WARN = args => VERBOSE_LEVEL >= 0 && console.log(args); // eslint-disable-line no-unused-vars
const INFO = args => VERBOSE_LEVEL >= 1 && console.log(args); // eslint-disable-line no-unused-vars
const DEBUG = args => VERBOSE_LEVEL >= 2 && console.log(args); // eslint-disable-line no-unused-vars

const file = argv._[0];
INFO(`File to be read: ${file}`);

const datesToPeople = [];
const STARTDATE = moment.unix(1451606400);
let previousDay = -1;

csv
  .fromPath(file)
  .on('data', (data) => {
    const datetime = moment.unix(parseInt(data[0], 10));
    const user = data[1];

    const day = datetime.diff(STARTDATE, 'days');
    if (day !== previousDay) {
      INFO(`Adding to day: ${day}`);
      previousDay = day;
    }

    if (!datesToPeople[day]) {
      datesToPeople[day] = {};
    }

    if (!datesToPeople[day][user]) {
      datesToPeople[day][user] = 1;

      // go back and add to previous consecutive days
      let dayCounter = day - 1;
      while (dayCounter >= 0 && datesToPeople[dayCounter] && datesToPeople[dayCounter][user]) {
        datesToPeople[dayCounter][user] += 1;
        dayCounter -= 1;
      }
    }
  })
  .on('end', () => {
    INFO('Done reading CSV');
    datesToPeople.forEach((day, index) => {
      DEBUG(`Processing day: ${index}`);
      DEBUG(`People in day: ${Object.keys(day).length}`);

      const usersConsecutive = [];

      Object.keys(day).forEach((user) => {
        if (!usersConsecutive[day[user] - 1]) {
          usersConsecutive[day[user] - 1] = 1;
        } else {
          usersConsecutive[day[user] - 1] += 1;
        }
      });

      let output = `${index + 1},`;
      const LAST_INDEX = 13;

      for (let consecutivePlayIndex = 0; consecutivePlayIndex < 14; consecutivePlayIndex += 1) {
        const consecutive = usersConsecutive[consecutivePlayIndex];
        if (consecutivePlayIndex === LAST_INDEX) {
          output += `${consecutive || 0}`;
        } else {
          output += `${consecutive || 0},`;
        }
      }

      console.log(output);
    });
  });
