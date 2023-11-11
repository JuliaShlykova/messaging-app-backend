const passport = require('passport');

exports.accessTokenAuth = passport.authenticate('accessJWT', { session: false });
exports.refreshTokenAuth = passport.authenticate('refreshJWT', { session: false });
