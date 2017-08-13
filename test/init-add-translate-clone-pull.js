import test from 'ava';
import fixture from './fixtures/fixtureOF.js';
import fsp from 'fs-promise';
import {init, push, translate, clone, pull, add, destroy} from './helpers/lieutenant.js';

const openformat = ['PO', 'po', '.po'];
test.serial('Init a project, add files, push, translate, clone in other dir, pull', async t => {
  const p_slug = 'init-add-translate';
  let ret;
  process.chdir(fixture.create(p_slug, openformat[1]));
  await init(p_slug, 'el', 'en,de', {
    name: p_slug,
    description: 'OPENFORMAT TESTS',
    i18n: openformat[0],
  });
  await add(['file1.po'], {});
  await add(['file2.po'], {});

  await push(undefined, {});
  await translate('file1.po', 'en', 'source string 1', 'en source string 1', {});
  await translate('file2.po', 'en', 'source string 11', 'en source string 11', {});
  await translate('file1.po', 'de', 'source string 1', 'de source string 1', {});
  process.chdir(fixture.create(p_slug + '-clone', openformat[1]));
  await clone(p_slug, {});
  await pull('en', 'file1.po', {});
  ret = await fsp.readFile('translations/file1.en.po');
  t.truthy(ret.toString().indexOf('en source string 1') !== -1);
  await pull('en', undefined, {});
  ret = await fsp.readFile('translations/file2.en.po');
  t.truthy(ret.toString().indexOf('en source string 11') !== -1);
  await pull(undefined, undefined, {});
  ret = await fsp.readFile('translations/file1.de.po');
  t.truthy(ret.toString().indexOf('de source string 1') !== -1);

  await destroy(p_slug, {});
  fixture.remove(p_slug);
  fixture.remove(p_slug + '-clone');
  t.pass();
});
