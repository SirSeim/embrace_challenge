#!/usr/bin/env node
const argv = require('yargs')
  .usage('Usage: $0 <file> [options]')
  .demandCommand(1)
  .count('verbose')
  .alias('v', 'verbose')
  .argv;
const csv = require("fast-csv");
const moment = require("moment");

const VERBOSE_LEVEL = argv.verbose;
const WARN = (args) => VERBOSE_LEVEL >= 0 && console.log(args);
const INFO = (args) => VERBOSE_LEVEL >= 1 && console.log(args);
const DEBUG = (args) => VERBOSE_LEVEL >= 2 && console.log(args);

const file = argv._[0];
INFO(`File to be read: ${file}`);

const datesToPeople = [];
const STARTDATE = moment.unix(1451606400);
var previousDay = -1;

csv
  .fromPath(file)
  .on("data", (data) => {
    const datetime = moment.unix(parseInt(data[0]));
    const user = data[1];

    const day = datetime.diff(STARTDATE, 'days');
    if (day !== previousDay) {
      DEBUG(`Adding to day: ${day}`);
      previousDay = day;
    }

    if (!datesToPeople[day]) {
      datesToPeople[day] = {};
    }

    if (!datesToPeople[day][user]) {
      datesToPeople[day][user] = 1;
      if (datesToPeople[day - 1] && datesToPeople[day - 1][user]) {
        datesToPeople[day][user] = datesToPeople[day - 1][user] + 1
      }
    }
  })
  .on("end", () => {
    INFO('Done reading CSV');
    datesToPeople.forEach((day, index) => {
      DEBUG(`Processing day: ${index}`);
      const usersConsecutive = [];
      Object.keys(day).forEach((user) => {
        if (!usersConsecutive[day[user] - 1]) {
          usersConsecutive[day[user] - 1] = 1;
        } else {
          usersConsecutive[day[user] - 1]++;
        }
      });
      DEBUG(usersConsecutive);

      var output = `${index + 1},`;
      const LAST_INDEX = usersConsecutive.length - 1;
      usersConsecutive.forEach((consecutive, index) => {
        if (index === LAST_INDEX) {
          output += `${consecutive}`;
        } else {
          output += `${consecutive},`;
        }
      });
      console.log(output);
    });
  });
