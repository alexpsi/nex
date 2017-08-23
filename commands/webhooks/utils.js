const path = require('path');
const os = require('os');
const yaml = require('js-yaml');
const fs = require('fs');

const getListenerConf = () => {
  let listener_conf;
  try {
    listener_conf = yaml.safeLoad(
      fs.readFileSync(path.join(os.homedir(), '.tx.listener.yml'), 'utf8')
    );
  } catch (e) {
    listener_conf = {
      github: { enabled: false, triggers: [] },
      transifex: { enabled: false, triggers: [] },
      generic: { enabled: false, triggers: [] },
    };
  }
  return listener_conf;
};

const setListenerConf = conf => {
  fs.writeFileSync(
    path.join(os.homedir(), '.tx.listener.yml'),
    yaml.safeDump(_.omitBy(conf, _.isUndefined)),
    'utf8'
  );
};

module.exports = {
  getListenerConf,
  setListenerConf,
};
