const HttpError = require("../models/http-error");
const { validationResult } = require("express-validator");
const mongoose = require("mongoose");
const Place = require("../models/place");
const Users = require("../models/user");

const getPlaceById = async (req, res, next) => {
  const placeId = req.params.pid;
  let place;
  try{
    place = await Place.findById(placeId);
  }
  catch(err){
    const error = new HttpError("Could not find place, please try again", 500);
    return next(error);
  }
  if (!place) {
    const error = new HttpError("Could not find the place for the provided Id", 404);
    return next(error);
  }
  res.json({ message: "Successfully recieved", place: place.toObject({ getters : true})});
};

const getPlacesByUserId = async (req, res, next) => {
  const userId = req.params.uid;
  let userWithPlaces;
  try{
    userWithPlaces = await Place.find({ creator : userId}).populate('places');
  }
  catch(err){
    const error =  new HttpError(
      "Could not find the place, please try again",
      500
    );
    return next(error);
  }
 
  if (!userWithPlaces || userWithPlaces.length === 0) {
    const error =  new HttpError(
      "Could not find the place for the provided user Id",
      404
    );
    return next(error);
  }
  res.json({ message: "Successfully recieved", place: userWithPlaces.map(users => users.toObject({ getters : true})) });
};

const createPlaces = async (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    const error = new HttpError("Invalid input passed, please check your data", 422);
    return next(error);
  }
  const { title, description, coordinates, address } = req.body;
  const createdPlace = new Place({
    title,
    description,
    location : coordinates,
    image: "https://picsum.photos/200",
    address,
    creator: req.userData.userId
  })
  // let user;
  // try{
  // user = await Users.findById(req.userData.userId);
  // }catch(err){
  // const error = new HttpError("Creating place failed, please try again", 500);
  // return next(error);
  // }

  // if(!user){
  //   const error = new HttpError("Could not find user with id, please try again", 500);
  //   return next(error); 
  // }
  try{
    // const sess = await mongoose.startSession();
    // sess.startTransaction();
    // await createdPlace.save({ session : sess});
    // user.places.push(createdPlace);
    // await user.save({ session : sess})
    // await sess.commitTransaction();
    await createdPlace.save();
  }
  catch(err){
    const error = new HttpError("Could not create place, please try again", 500);
    return next(error);
  }
  res.status(201).json({ message: "Successfully created", place: createdPlace.toObject({ getters: true}) });
};

const updatePlaces = async (req, res, next) => {
  const errors = validationResult(req);
  if(!errors.isEmpty()){
    const error = new HttpError("Invalid input passed, please check your data", 422);
    return next(error);
  }
  const placeId = req.params.pid;
  const { title, description } = req.body;
  let place;
  try{
    place = await Place.findById(placeId);
  }
  catch(err){
    const error = new HttpError("Could not update place, please try again", 500);
    return next(error);
  }
  if(place.creator.toString() !== req.userData.userId){
    const error = new HttpError("You are not allowed to edit this place", 401);
    return next(error);
  }
  place.title = title;
  place.description = description;
  try{
    await place.save();
  }
  catch(err){
    const error = new HttpError("Could not update place, please try again", 500);
    return next(error);
  }
  res.status(200).json({ message: "Successfully updated", place: place.toObject({ getters: true}) });
};

const deletePlaceById = async (req, res, next) => {
    const placeId = req.params.pid;
    let place;
    try{
      place = await Place.findById(placeId).populate('creator');
    }
    catch(err){
      const error = new HttpError("Coulc not delete place, please try again", 500);
      return next(error);
    }
    if(!place){
      const error = new HttpError("Could not find the placeId", 500);
      return next(error);
    }
    if(place.creator.id !== req.userData.userId){
 const error = new HttpError("You are not allowed to edit this place", 401);
    return next(error);
    }
    try{
      // const sess = await mongoose.startSession();
      // sess.startTransaction();
      // await place.deleteOne({ session: sess});
      // await place.creator.places.pull(place);
      // await place.creator.save({ session : sess})
      await place.deleteOne();
    }
    catch(err){
      const error = new HttpError("Could not delete place, please try again", 500);
      return next(error);
    }
    
    res.status(200).json({message: "Successfully deleted"})
}

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createPlaces = createPlaces;
exports.updatePlaces = updatePlaces;
exports.deletePlaceById = deletePlaceById;
