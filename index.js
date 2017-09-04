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

const addPersonToData = (data, person, day) => {
  if (!data[day]) {
    data[day] = {};
  }

  if (!data[day][person]) {
    data[day][person] = 1;

    var dayCounter = day - 1;
    while (dayCounter >= 0 && data[dayCounter] && data[dayCounter][person]) {
      data[dayCounter][person]++;
      dayCounter--;
    }
  }
};

csv
  .fromPath(file)
  .on("data", (data) => {
    const datetime = moment.unix(parseInt(data[0]));
    const user = data[1];

    const day = datetime.diff(STARTDATE, 'days');
    if (day !== previousDay) {
      INFO(`Adding to day: ${day}`);
      previousDay = day;
    }

    addPersonToData(datesToPeople, user, day);
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
      DEBUG(`People in day: ${Object.keys(day).length}`);

      var output = `${index + 1},`;
      const LAST_INDEX = 13;
      for (var consecutivePlayIndex = 0; consecutivePlayIndex < 14; consecutivePlayIndex++) {
        var consecutive = usersConsecutive[consecutivePlayIndex];
        if (consecutivePlayIndex === LAST_INDEX) {
          output += `${consecutive || 0}`;
        } else {
          output += `${consecutive || 0},`;
        }
      }
      console.log(output);
    });
  });
