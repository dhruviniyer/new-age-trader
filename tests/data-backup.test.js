import test from 'node:test';
import assert from 'node:assert/strict';
import { dashboardBackup, parseDashboardBackup } from '../src/data-backup.js';

const saved = {
  trades: [{ id: 1, date: '2026-10-07', symbol: 'GOLD', side: 'Short', entry: 100, exit: 90, sl: 105, target: 85, qty: 2, strategy: 'TWST', notes: 'Saved trade', image: 'data:image/png;base64,Y2hhcnQ=' }],
  holdings: [{ id: 2, symbol: 'BHFL', qty: 3, avg: 171, price: 180 }],
  mistakes: [{ id: 3, date: '2026-10-06', category: 'Early Entry', title: 'Wait for close', lesson: 'Follow the plan', severity: 'Medium' }],
  analyses: [{ id: 4, date: '2026-10-07', title: 'Gold setup', thesis: 'Keep the chart and notes together', image: 'data:image/jpeg;base64,c2NyZWVuc2hvdA==' }],
  checklist: { setup: true, sl: true, sizing: false, rr: true, calm: false }
};

test('moving a backup between hosts preserves trades, charts, holdings, lessons and checklist', () => {
  const exported = dashboardBackup(saved, '2026-10-07T06:00:00Z');
  assert.deepEqual(parseDashboardBackup(exported), saved);
  assert.equal(JSON.parse(exported).exportedAt, '2026-10-07T06:00:00Z');
});

test('a raw backup of the existing browser storage can also be restored', () => {
  assert.deepEqual(parseDashboardBackup(JSON.stringify(saved)), saved);
  const empty = { trades: [], holdings: [], mistakes: [], analyses: [], checklist: saved.checklist };
  assert.deepEqual(parseDashboardBackup(dashboardBackup(empty)), empty);
});

test('incomplete, incompatible and unusable backups are rejected', () => {
  for (const invalid of [
    'not json', 'null', '{}',
    JSON.stringify({ ...saved, holdings: null }),
    JSON.stringify({ ...saved, checklist: { ...saved.checklist, calm: 'yes' } }),
    JSON.stringify({ ...saved, trades: [{ ...saved.trades[0], side: 'Other' }] }),
    JSON.stringify({ ...saved, trades: [{ ...saved.trades[0], notes: { unexpected: true } }] }),
    JSON.stringify({ ...saved, holdings: [{ ...saved.holdings[0], price: 'not a number' }] }),
    JSON.stringify({ format: 'another-app', version: 1, data: saved }),
    JSON.stringify({ format: 'new-age-trader-backup', version: 2, data: saved })
  ]) assert.throws(() => parseDashboardBackup(invalid));
});
