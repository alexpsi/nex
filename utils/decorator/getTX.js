const TransifexApi = require('transifex-js-client');
const getRC = require('./getRC.js');
const request = require('superagent'); // I know its funny that is all written in axios and we use superagent here, but we needed the progress events...
const fs = require('fs');

const patchTX = tx => {
  tx.resourceCreateFile = (project_slug, form, file, options = {}) => request.
    post(tx.urls['resources'].replace('<project_slug>', project_slug)).
    auth(tx.username, tx.password).
    field('name', form.name).
    field('slug', form.slug).
    field('i18n_type', form.i18n_type).
    field('content', fs.createReadStream(file)).
    on('progress', p => {
      if (options.onUploadProgress) {
        options.onUploadProgress(Math.floor((p.loaded / p.total) * 100));
      }
    });

  tx.resourceUpdateFile = (p_slug, r_slug, filepath, options = {}) =>
    request.put(
      tx.urls['resourceUpdate'].
        replace('<project_slug>', p_slug).
        replace('<resource_slug>', r_slug)
    ).
      auth(tx.username, tx.password).
      field('content', fs.createReadStream(filepath)).
      on('progress', p => {
        if (options.onUploadProgress) {
          options.onUploadProgress(Math.floor((p.loaded / p.total) * 100));
        }
      });

  return tx;
};

module.exports = (c, options) => {
  let RC, tx = {}, host;
  // Credentials passed through CLI arguments override .transifexrc
  host = c.get('main:host') || options.parent.host;
  try {
    RC = {
      username: options.parent.username,
      password: options.parent.pass,
      token: options.parent.token,
      base_url: host,
    };
    c.set('username', RC.username);
    if (RC.token) RC.username = undefined;
    tx = patchTX(TransifexApi(RC));
  } catch (e) {
    RC = getRC(host);
    c.set('username', RC.username);
    if (RC.token) RC.username = undefined;
    tx = patchTX(TransifexApi(RC));
  }
  return tx;
};
