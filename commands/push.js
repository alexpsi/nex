const deco = require('../utils/decorator');
const Listr = require('listr');
const Observable = require('rxjs').Observable;
let tx_counts = { add: 0, update: 0 };

module.exports = program => program.
  command('push').
  description([
    'Creates new resources at TX for staged files and updates',
    ' existing resources if their files have changed.\n'
  ]).
  action(deco({ enhance: true }, command));

const command = (conf, tx, log, options) => {
  tx_counts = { add: 0, update: 0 };
  const tasks = new Listr([{
    title: 'Push changes in tracked files to Transifex',
    task: () => update_tracked(conf, tx),
  }, {
    title: 'Push staged files to Transifex',
    task: () => push_staged(conf, tx),
  }, {
    title: 'Update project meta',
    task: () => conf.updateTX(),
  }], {
    collapse: false, renderer: conf.ListrRender,
  });
  return tasks.run().then(() => {
    log.info(`new: ${tx_counts.add} updated: ${tx_counts.update}`);
    return {
      'new': tx_counts.add,
      updated: tx_counts.update,
    };
  });
};

const push_staged = (conf, tx) => new Listr(
  conf.getStagedFiles().map(entry => {
    return {
      title: entry.filepath,
      task: (ctx, task) => new Observable(observer =>
        createResource(conf, tx, entry, observer)),
    };
  }), {
    concurrent: conf.get('global:max_concurrency'), renderer: conf.ListrRender,
  }
);

const createResource = (conf, tx, entry, observer) => {
  return conf.getFile(entry).then(file => {
    const slug = entry.slug;
    let i18n_type = (entry.virtual) ? 'PO' : conf.get(`staged:${slug}:i18n_type`) || conf.get(`defs:i18n_type`);
    return tx.resourceCreateFile(conf.get('main:project'), {
      slug: `${conf.branch}-${slug}`,
      name: entry.filepath,
      i18n_type,
    }, file, {
      onUploadProgress: p => {
        if (p < 100) return observer.next(`Uploading ${p}%`);
        return observer.next('Upload complete. Processing');
      },
    }).then(() => {
      conf.removeFromStaging(entry);
      entry.c_hash = conf.hashFile(file);
      conf.addToTracking(entry);
      tx_counts.add++;
      return conf.save().then(observer.complete());
    });
  });
};

const update_tracked = (conf, tx) => new Listr(
  conf.getTrackedFiles().map(entry => {
    return {
      title: `${entry.filepath}`,
      task: (ctx, task) => new Observable(observer =>
        updateResource(conf, tx, entry, observer).catch(e => {
          if (e === 'Not changed') {
            task.skip();
          } else {
            observer.next(e);
          }
          observer.complete();
        })
      ),
    };
  }), {
    concurrent: conf.get('global:max_concurrency'), renderer: conf.ListrRender,
  }
);

const updateResource = function(conf, tx, entry, observer) {
  const slug = entry.slug;
  return conf.getFile(entry).then(file => {
    const f_hash = conf.hashFile(file);
    if (f_hash == entry.c_hash) return Promise.reject('Not changed');
    entry.c_hash = f_hash;
    return tx.resourceUpdateFile(
      conf.get('main:project'),
      `${conf.branch}-${slug}`,
      file,
      {
        onUploadProgress: p => {
          if (p < 100) return observer.next(`Uploading ${p}%`);
          return observer.next('Upload complete. Processing');
        },
      }
    ).then(() => {
      observer.complete();
      tx_counts.update++;
    });
  });
};

module.exports.command = command;
