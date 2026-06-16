function normalizeId(value) {
  if (value == null) return '';
  return String(value).trim();
}

function normalizeSemester(value) {
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

function idsMatch(a, b) {
  return normalizeId(a) === normalizeId(b);
}

function semestersMatch(a, b) {
  return normalizeSemester(a) === normalizeSemester(b);
}

module.exports = {
  normalizeId,
  normalizeSemester,
  idsMatch,
  semestersMatch,
};
