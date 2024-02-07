const jwt = require('jsonwebtoken');

const generateAccessToken = (user) => {
  return jwt.sign(
    {userId: user._id, nickname: user.nickname},
    process.env.ACCESS_TOKEN_SECRET,
    { expiresIn: '1h' }
  );
}

const generateTokens = (user) => {
  const accessToken = generateAccessToken(user);
  const refreshToken = jwt.sign(
    {userId: user._id},
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: '1d' }
  );

  return { accessToken, refreshToken };
}

const refreshTokenOpts = {
  httpOnly: true, //JS has no acces to the cookie on the client
  secure: true, // https: scheme only except for localhost
  maxAge: 1 * 24 * 60 * 60 * 1000, // 1 day until cookie expires
  sameSite: 'None', // cross-site request
  path: '/auth' // must exist in the url for the browser to send cookie
};

module.exports = { 
  generateAccessToken,
  generateTokens,
  refreshTokenOpts
 }