import test from 'node:test';
import assert from 'node:assert/strict';
import {
  toast,
  configureToastStore,
  getToastSnapshot,
  resetToastStore,
  pauseToast,
  resumeToast,
} from './toastStore.js';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

test('toast variants add notifications with expected fields and upward stack order', () => {
  resetToastStore();
  configureToastStore({ defaultDuration: 0, exitDuration: 0 });

  const id1 = toast.success('Branch created');
  const id2 = toast.error('Save failed');
  const id3 = toast.warning('Low stock alert');
  const id4 = toast.info('Schedule synced');

  const items = getToastSnapshot();
  assert.equal(items.length, 4);
  assert.deepEqual(
    items.map((t) => [t.id, t.variant, t.message]),
    [
      [id1, 'success', 'Branch created'],
      [id2, 'error', 'Save failed'],
      [id3, 'warning', 'Low stock alert'],
      [id4, 'info', 'Schedule synced'],
    ],
  );
  resetToastStore();
});

test('toast deduplicates identical active notifications for the same action', () => {
  resetToastStore();
  configureToastStore({ defaultDuration: 0, exitDuration: 0 });

  const firstId = toast.success('Appointment saved');
  const secondId = toast.success('Appointment saved');

  assert.equal(firstId, secondId);
  assert.equal(getToastSnapshot().length, 1);
  assert.equal(getToastSnapshot()[0].refreshKey, 1);
  resetToastStore();
});

test('toast enforces maxToasts by dismissing oldest toast first', () => {
  resetToastStore();
  configureToastStore({ defaultDuration: 0, maxToasts: 3, exitDuration: 0 });

  toast.info('One');
  toast.info('Two');
  toast.info('Three');
  toast.info('Four');

  const messages = getToastSnapshot().map((t) => t.message);
  assert.deepEqual(messages, ['Two', 'Three', 'Four']);
  resetToastStore();
});

test('toast auto-dismisses after configured duration and transitions through exiting state', async () => {
  resetToastStore();
  configureToastStore({ defaultDuration: 60, exitDuration: 40 });

  const id = toast.success('Temporary toast');
  assert.equal(getToastSnapshot().length, 1);
  assert.equal(getToastSnapshot()[0].exiting, false);

  await sleep(85);
  const mid = getToastSnapshot();
  assert.equal(mid.length, 1);
  assert.equal(mid[0].id, id);
  assert.equal(mid[0].exiting, true);

  await sleep(60);
  assert.equal(getToastSnapshot().length, 0);
  resetToastStore();
});

test('pauseToast and resumeToast suspend and resume auto-dismiss timer', async () => {
  resetToastStore();
  configureToastStore({ defaultDuration: 120, exitDuration: 0 });

  const id = toast.info('Hover test');
  await sleep(30);
  pauseToast(id);

  await sleep(140);
  assert.equal(getToastSnapshot().length, 1);
  assert.equal(getToastSnapshot()[0].paused, true);

  resumeToast(id);
  assert.equal(getToastSnapshot()[0].paused, false);

  await sleep(320);
  assert.equal(getToastSnapshot().length, 0);
  resetToastStore();
});

test('toast.dismiss(id) and toast.clear() dismiss individual and all toasts', () => {
  resetToastStore();
  configureToastStore({ defaultDuration: 0, exitDuration: 0 });

  const a = toast.success('First');
  toast.warning('Second');
  toast.dismiss(a);

  assert.deepEqual(
    getToastSnapshot().map((t) => t.message),
    ['Second'],
  );

  toast.clear();
  assert.equal(getToastSnapshot().length, 0);
  resetToastStore();
});
