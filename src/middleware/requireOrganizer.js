const config = require("../config");
const ApiError = require("../utils/ApiError");

module.exports = function requireOrganizer(req, res, next) {
  const passcode = req.get("x-organizer-passcode");
  if (!passcode || passcode !== config.organizerPasscode) {
    return next(ApiError.unauthorized("Missing or invalid organizer passcode"));
  }
  next();
};
