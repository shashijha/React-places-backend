const express = require("express");
const { check } = require("express-validator");
const router = express.Router();
const placeControllers = require("../controllers/places-controllers");
const checkAuth = require("../middleware/check-auth");

router.get("/:pid", placeControllers.getPlaceById);

router.get("/user/:uid", placeControllers.getPlacesByUserId);

router.use(checkAuth);

router.post(
  "/",
  [ check("title").not().isEmpty(),
  check("description").isLength({ min: 5 }),
  check("address").not().isEmpty() ],
  placeControllers.createPlaces
);

router.patch(
  "/:pid",
  [ check("title").not().isEmpty(),
  check("description").isLength({ min: 5 }) ],
  placeControllers.updatePlaces
);

router.delete("/:pid", placeControllers.deletePlaceById);

module.exports = router;
