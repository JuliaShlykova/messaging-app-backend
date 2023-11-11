const jwt = require('jsonwebtoken');
const { trusted } = require('mongoose');

const generateAccessToken = (user) => {
  return jwt.sign(
    {userId: user._id, nickname: user.nickname},
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '30d' }
  );
}

const generateTokens = (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(
    {userId: user._id},
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '30d' }
  );

  return { accessToken, refreshToken };
}

const refreshTokenOpts = {
  httpOnly: true, //JS has no acces to the cookie on the client
  secure: true, // https: scheme only except of localhost
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days until cookie expires
  sameSite: 'None', // cross-site request
  path: '/auth' // must exist in the url for the browser to send cookie
};

module.exports = { 
  generateAccessToken,
  generateTokens,
  refreshTokenOpts
 }