const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { body, validationResult } = require('express-validator');
const { generateTokens, generateAccessToken, refreshTokenOpts } = require('../utils/tokens');
const passport = require('passport');
const User = require('../models/User');

exports.login = async (req, res, next) => {
  try {
    const {email, password} = req.body;

    const user = await User.findOne({email});
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const tokens = generateTokens({_id: user._id, nickname: user.nickname});
    res
      .cookie('refresh_token', tokens.refreshToken, refreshTokenOpts)
      .status(200)
      .json({token: tokens.accessToken, userId: user._id});
  } catch(err) {
    next(err);
  }
}

exports.signup = [
  body('nickname')
  .trim()
  .isLength({min: 1})
  .escape()
  .withMessage('nickname must be specified')
  .isLength({max: 40})
  .withMessage('nickname mustn\'t exceed 40 characters'),
  body('email')
  .trim()
  .isEmail()
  .isLength({min: 1})
  .escape()
  .withMessage('email must be specified')
  .isLength({max: 254})
  .withMessage('email mustn\'t exceed 254 characters'),  
  body('password')
  .trim()
  .isLength({min: 8})
  .escape()
  .withMessage('password must be at least 8 characters'),
  body('confirm_password')
  .trim()
  .escape()
  .custom((value, {req}) => {
    if (value!==req.body.password) {
      throw new Error('Passwords must be the same');
    }
    return true;
  }),
  async (req, res, next) => {
  try {
    const { email, password, nickname } = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({'errors': errors.array()});
    }
    const existingEmail = await User.findOne({email});
    if (existingEmail) {
      return res.status(409).json({"errors": [{ msg: 'The email is already in the database. Please, login.' }]})
    }
    const existingNickname = await User.findOne({nickname});
    if (existingNickname) {
      return res.status(409).json({"errors": [{ msg: 'The nickname is already in the database. Please, login.' }]})
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ email, nickname, password: hashedPassword });
    await newUser.save();
    const tokens = generateTokens({_id: newUser._id, nickname: newUser.nickname});
    res
      .cookie('refresh_token', tokens.refreshToken, refreshTokenOpts)
      .status(200)
      .json({token: tokens.accessToken, userId: newUser._id});
  } catch(err) {
    next(err);
  }
}]

exports.refresh = async (req, res, next) => {
  try {
    const token = generateAccessToken(req.user);
    res.status(200).json({token})
  } catch(err) {
    next(err);
  }
}

exports.logout = (req, res) => {
  res.clearCookie("refresh_token").status(200).json({ message: "Logout successful" });
}