import test from 'ava';
import fixture from './fixtures/fixtureOF.js';
import {init, push, add, destroy} from './helpers/lieutenant.js';

const openformat = ['PO', 'po', '.po'];
test('Init a project, add files, push, add more, push, test updated', async t => {
  const p_slug = 'init-add-push';
  let ret;
  process.chdir(fixture.create(p_slug, openformat[1]));
  await init(p_slug, 'el', 'en,de', {
    name: p_slug,
    description: 'OPENFORMAT TESTS',
    i18n: openformat[0],
  });
  await add(['file1.po'], {});
  await add(['file2.po'], {});
  ret = await push(undefined, {});
  t.deepEqual(ret, { 'new': 2, updated: 0 });
  await add(['file3.po'], {});
  ret = await push(undefined, {});
  t.deepEqual(ret, { 'new': 1, updated: 0 });
  fixture.replace('file1.po', 'file4.po');
  ret = await push(undefined, {});
  t.deepEqual(ret, { 'new': 0, updated: 1 });
  await destroy('init-add-push', {});
  fixture.remove('init-add-push');
  t.pass();
});
