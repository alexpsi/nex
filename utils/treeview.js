const path = require('path');
const _ = require('lodash');

const prepareTree = (entries, label) => {
  let root = {
    label,
    nodes: [],
  };
  _.each(entries, entry => {
    _.reduce(entry.filepath.split('/'), (parent, label) => {
      let next = _.find(parent.nodes, { label });
      if (parent.nodes && !next) {
        parent.nodes.push({label, nodes: []});
        next = _.find(parent.nodes, {label});
      }
      return next;
    }, root);
  });
  return root;
};

const mapLeaves = (node, fn, label, treepath = '') => {
  if (!node.nodes || node.nodes.length == 0) {
    return fn(node, path.join(treepath, node.label));
  }
  treepath = (node.label == label) ? '' : path.join(treepath, node.label);
  return {
    label: node.label,
    nodes: _.map(node.nodes, (next) => (mapLeaves(next, fn, label, treepath))),
  };
};

module.exports = {
  prepareTree,
  mapLeaves,
};
