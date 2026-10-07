const FORMAT = 'new-age-trader-backup';
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const isText = value => typeof value === 'string';
const isNumber = value => (typeof value === 'number' || (isText(value) && value.trim() !== '')) && Number.isFinite(Number(value));
const hasId = item => isNumber(item.id) || (isText(item.id) && item.id.trim() !== '');
const optionalText = (item, keys) => keys.every(key => item[key] === undefined || isText(item[key]));
const optionalNumbers = (item, keys) => keys.every(key => item[key] === undefined || isNumber(item[key]));

export function dashboardBackup(data, exportedAt = new Date().toISOString()) {
  return JSON.stringify({ format: FORMAT, version: 1, exportedAt, data }, null, 2);
}

export function parseDashboardBackup(text) {
  const backup = JSON.parse(text);
  let data = backup;
  if (isRecord(backup) && Object.hasOwn(backup, 'format')) {
    if (backup.format !== FORMAT || backup.version !== 1) throw new Error('Unsupported dashboard backup.');
    data = backup.data;
  }
  const validators = {
    trades: item => isText(item.symbol) && ['Long', 'Short'].includes(item.side) &&
      ['entry', 'exit', 'qty'].every(key => isNumber(item[key])) &&
      optionalNumbers(item, ['sl', 'target']) && optionalText(item, ['date', 'strategy', 'notes', 'image']),
    holdings: item => isText(item.symbol) && ['qty', 'avg', 'price'].every(key => isNumber(item[key])),
    mistakes: item => ['date', 'category', 'title', 'lesson', 'severity'].every(key => isText(item[key])),
    analyses: item => ['date', 'title', 'image'].every(key => isText(item[key])) && optionalText(item, ['thesis'])
  };
  if (!isRecord(data) || !Object.entries(validators).every(([key, valid]) =>
    Array.isArray(data[key]) && data[key].every(item => isRecord(item) && hasId(item) && valid(item))) ||
    !isRecord(data.checklist) || !['setup', 'sl', 'sizing', 'rr', 'calm'].every(key => typeof data.checklist[key] === 'boolean')) {
    throw new Error('This file does not contain a complete dashboard backup.');
  }
  return data;
}
