const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Users = require("../models/user");

const getUsers = async (req, res, next) => {
  let users;
  try {
    users = await Users.find({}, "-password");
  } catch (err) {
    const error = new HttpError("Could not get all users", 500);
    return next(error);
  }
  res.json({ message: "Successfully recieved", users: users });
};

const signup = async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const error = new HttpError(
      "Invalid input passed, please check your data",
      422
    );
    return next(error);
  }
  const { name, email, password } = req.body;
  let hasUser;
  try {
    hasUser = await Users.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Could not able to signup", 500);
    return next(error);
  }
  if (hasUser) {
    const error = new HttpError(
      "Could not create user, email already exists",
      422
    );
    return next(error);
  }
  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    const error = new HttpError("Could not create user, please try again");
    return next(error);
  }
  const createdUser = new Users({
    name,
    email,
    password: hashedPassword,
    image: "https://www.gravatar.com/avatar/91cac40f29cb70f7b6f7ab9d5a64d56f5968f93bcaf1bab6fc3084630bb7ccae",
    places: [],
  });
  try {
    hasUser = await createdUser.save();
  } catch (err) {
    const error = new HttpError("Could not able to signup", 500);
    return next(error);
  }

  let token;
  try{
    token = jwt.sign(
        { userId: createdUser.id, email: createdUser.email },
        process.env.JWT_KEY,
        { expiresIn: "1h" }
      );
  }
  catch(err){
    const error = new HttpError("Signing up failed, please try again later");
    return next(error);
  }

  res.status(201).json({ userId : createdUser.id, email : createdUser.email, token : token});
};

const login = async (req, res, next) => {
  const { email, password } = req.body;
  let identifiedUser;
  try {
    identifiedUser = await Users.findOne({ email: email });
  } catch (err) {
    const error = new HttpError("Could not able to login", 500);
    return next(error);
  }

  if (!identifiedUser) {
    const error = new HttpError(
      "Could not identified error, credentials seems to be wrong",
      401
    );
    return next(error);
  }
  let isValidPassword;
  try {
    isValidPassword = await bcrypt.compare(password, identifiedUser.password);
  } catch (err) {
    const error = new HttpError(
      "Could not log you in, please check your credentials",
      500
    );
    return next(error);
  }
  if (!isValidPassword) {
    const error = new HttpError(
      "Could not log you in yeah, please check your credentials",
      500
    );
    return next(error);
  }

  let token;
  try{
    token = jwt.sign(
        { userId: identifiedUser.id, email: identifiedUser.email },
        process.env.JWT_KEY,
        { expiresIn: "1h" }
      );
  }
  catch(err){
    const error = new HttpError("Signing up failed, please try again later");
    return next(error);
  }
  res.json({ userId : identifiedUser.id, email : identifiedUser.email, token : token});
};

exports.getUsers = getUsers;
exports.signup = signup;
exports.login = login;
