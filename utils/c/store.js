const store = {};

function set(obj, keyPath, value) {
  keyPath = keyPath.split(':');
  let lastKeyIndex = keyPath.length - 1;
  let key;
  for (var i = 0; i < lastKeyIndex; ++i) {
    key = keyPath[i];
    if (!(key in obj)) { obj[key] = {}; }
    obj = obj[key];
  }
  obj[keyPath[lastKeyIndex]] = value;
}

function get(obj, keyPath) {
  keyPath = keyPath.split(':');
  let lastKeyIndex = keyPath.length - 1;
  let key;
  for (var i = 0; i < lastKeyIndex; ++i) {
    key = keyPath[i];
    if (!(key in obj)) { return undefined; }
    obj = obj[key];
  }
  return obj[keyPath[lastKeyIndex]];
}

module.exports = {
  set: (keypath, value) => set(store, keypath, value),
  get: (keypath) => get(store, keypath),
};
