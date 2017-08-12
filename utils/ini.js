// HACKY: Wrapper around node-ini in order to disable handling of dots in
// headers as nested sections.

var fs = require('fs');
var ini = require('ini');

module.exports = {
  read: function(filename) {
    var f = fs.readFileSync(filename, 'utf-8');
    f = f.split('\n');
    let re = /^\[\S*\]$/gm;
    f = f.map((line) => ((re.test(line)) ? line.replace(/\./g, '-DOT-') : line));
    f = ini.parse(f.join('\n'));
    var q = {};
    Object.keys(f).map((key) => {
      q[key.replace(/-DOT-/g, '.')] = f[key];
    });
    return q;
  },
  write: function(filename, content) {
    let enc = ini.encode(content).replace(/\\\./g, '.');
    fs.writeFileSync(filename, enc);
  },
};
