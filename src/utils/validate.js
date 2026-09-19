const ApiError = require("./ApiError");

function invalid(field, message) {
  throw ApiError.badRequest(`${field} ${message}`, { field });
}

function requireString(value, field, { min = 1, max = Infinity } = {}) {
  if (typeof value !== "string") invalid(field, "must be a string");
  const result = value.trim();
  if (result.length < min || result.length > max) invalid(field, `must have length between ${min} and ${max}`);
  return result;
}

function requireInt(value, field, { min = -Infinity, max = Infinity } = {}) {
  if (!Number.isSafeInteger(value)) invalid(field, "must be a safe integer");
  if (value < min || value > max) invalid(field, `must be between ${min} and ${max}`);
  return value;
}

function requireOneOf(value, field, allowedValuesObject) {
  const allowed = Object.values(allowedValuesObject);
  if (!allowed.includes(value)) invalid(field, `must be one of: ${allowed.join(", ")}`);
  return value;
}

function requireIsoDate(value, field) {
  // Accept YYYY-MM-DD or a timestamp with seconds and an explicit timezone.
  const iso = /^\d{4}-\d{2}-\d{2}(?:T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\d(?:\.\d{1,3})?(?:Z|[+-](?:[01]\d|2[0-3]):[0-5]\d))?$/;
  if (typeof value !== "string" || !iso.test(value)) invalid(field, "must be an ISO date or timestamp with timezone");
  const date = new Date(value);
  const day = new Date(`${value.slice(0, 10)}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime()) || Number.isNaN(day.getTime()) || day.toISOString().slice(0, 10) !== value.slice(0, 10)) {
    invalid(field, "must be a valid calendar date");
  }
  return date;
}

// Only an omitted value is optional; null and empty strings are validated.
const optional = (validate) => (value, ...args) => value === undefined ? undefined : validate(value, ...args);

module.exports = {
  requireString,
  requireInt,
  requireOneOf,
  requireIsoDate,
  optionalString: optional(requireString),
  optionalInt: optional(requireInt),
  optionalOneOf: optional(requireOneOf),
  optionalIsoDate: optional(requireIsoDate),
};
