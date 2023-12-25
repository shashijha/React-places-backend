const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const Places = require("../models/place");
const jwt = require("jsonwebtoken");

const placeData = {
  _id: "64c39dc8c602f4b7d78618f3",
  title: "Taj Mahal",
  description:
    "An immense mausoleum of white marble, built in Agra between 1631 and 1648 by order of the Mughal emperor Shah Jahan in memory of his favourite wife",
  image: "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50",
  address: "Agra, Uttar Pradesh, India",
  location: {
    lat: 27.173891,
    lng: 78.042068,
  },
  creator: new mongoose.Types.ObjectId(),
};

jest.mock("jsonwebtoken");

describe("controllers/places-controllers.js", () => {
  beforeEach((done) => {
    mongoose.connect("mongodb://localhost:27017", {
      useNewUrlParser: true,
    });
    mongoose.connection
      .once("open", () => done())
      .on("error", (error) => {
        console.error("Error connecting to test database:", error);
      });
  });

  afterEach((done) => {
    mongoose.connection.close(() => done());
  });

  beforeEach(async () => {
    await Places.deleteMany();
    const place = new Places(placeData);
    await place.save();
  });
  describe("GET /:pid", () => {
    it("should return 200 when getPlaceById called successfully", async () => {
      const res = await request(app).get(
        "/api/places/64c39dc8c602f4b7d78618f3"
      );
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("place");
      expect(res.body.message).toEqual("Successfully recieved");
    });

    it("should return 404 when place is not found by given Id", async () => {
      const res = await request(app).get(
        "/api/places/64c39dc8c602f4b7d78618f4"
      );
      expect(res.statusCode).toEqual(404);
      expect(res.body.message).toEqual(
        "Could not find the place for the provided Id"
      );
    });
  });

  describe("POST /places", () => {
    it("should return 200 when createPlaces called successfully", async () => {
      jest.spyOn(jwt, "verify").mockReturnValue("mocked-jwt-token");
      const place = {
        title: "Mahakaleshwar Jyotirlinga",
        description:
          "It is a Hindu temple dedicated to Shiva and is one of the twelve Jyotirlingas",
        image:
          "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50",
        address: "Ujjain, Madhya Pradesh, India",
        creator: "64c39dc8c602f4b7d78618f3",
      };
      const res = await request(app)
        .post("/api/places")
        .set("Authorization", "Bearer mocked-jwt-token")
        .send(place);
      expect(res.statusCode).toEqual(201);
      expect(res.body).toHaveProperty("place");
      expect(res.body.message).toEqual("Successfully created");
    });

    it("should return 422 when required data is not provided", async () => {
      const place = {
        title: "Mahakaleshwar Jyotirlinga",
        description:
          "It is a Hindu temple dedicated to Shiva and is one of the twelve Jyotirlingas",
      };
      const res = await request(app)
        .post("/api/places")
        .set("Authorization", "Bearer mocked-jwt-token")
        .send(place);
      expect(res.statusCode).toEqual(422);
      expect(res.body.message).toEqual("Invalid input passed, please check your data");
    });
  });
});
