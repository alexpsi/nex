const path = require('path');
const fs = require('fs');
const ini = require('../ini.js');
const os = require('os');

const findRC = function(start) {
  start = start || process.cwd();
  if (typeof start === 'string') {
    if (start[start.length - 1] !== path.sep) {
      start += path.sep;
    }
    start = start.split(path.sep);
  }
  if (!start.length) throw new Error('.transifexrc not found');
  start.pop();
  var dir = start.join(path.sep);
  try {
    fs.statSync(path.join(dir, '.transifexrc'));
    return dir;
  } catch (e) {}
  return findRC(start);
};

const getRC = function(host) {
  try {
    let rc_path = path.join(os.homedir(), '.transifexrc');
    rc_path = (fs.existsSync(rc_path)) ? os.homedir() : findRC();
    return ini.read(path.join(rc_path, '.transifexrc'))[host];
  } catch (e) { return {}; }
};

module.exports = function(host) {
  const RC = getRC(host);
  return {
    username: RC.username || process.env.TX_USERNAME,
    password: RC.password || process.env.TX_PASSWORD,
    base_url: host,
    token: RC.token || process.env.TX_TOKEN,
  };
};
