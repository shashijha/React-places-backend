const request = require("supertest");
const app = require("../app");
const mongoose = require("mongoose");
const Users = require("../models/user");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userData = {
  _id: new mongoose.Types.ObjectId(),
  name: "Shashi",
  email: "sshekharjha29@gmail.com",
  password: "Password@123",
  image: "https://www.gravatar.com/avatar/91cac40f29cb70f7b6f7ab9d5a64d56f5968f93bcaf1bab6fc3084630bb7ccae",
  places: [],
};

jest.mock("bcryptjs");
jest.mock("jsonwebtoken");

describe("controllers/users-controllers.js", () => {
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
    await Users.deleteMany();
    const user = new Users(userData);
    await user.save();
  });
  describe("GET /users", () => {
    it("should return 200 when getUsers called successfully", async () => {
      const res = await request(app).get("/api/users");
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty("users");
      expect(res.body.message).toEqual("Successfully recieved");
    });
  });

  describe("POST /signup", () => {
    it("should sign up successfully", async () => {
      jest.spyOn(jwt, "sign").mockReturnValue("mocked-jwt-token");
      const res = await request(app).post("/api/users/signup").send({
        name: "David",
        email: "DavidChristophers@gmail.com",
        password: "DavidChristophers@29",
      });
      const newUser = {
        name: "David",
        email: "DavidChristophers@gmail.com",
        password: "DavidChristophers@29",
        image: "https://www.gravatar.com/avatar/205e460b479e2e5b48aec07710c08d50",
        places: [],
      }
      const createdUser = new Users(newUser);
      await createdUser.save();
      expect(res.statusCode).toEqual(201);
      expect(res.body.token).toEqual("mocked-jwt-token");
    });
    it("should return 422 when name is empty", async () => {
      const res = await request(app).post("/api/users/signup").send({
        name: "",
        email: "johnMot@gmail.com",
        password: "John@29",
      });
      expect(res.statusCode).toEqual(422);
      expect(res.body.message).toEqual(
        "Invalid input passed, please check your data"
      );
    });

    it("should return 422 when user email is invalid", async () => {
      const res = await request(app).post("/api/users/signup").send({
        name: "",
        email: "johnMot@hello.com",
        password: "John@29",
      });
      expect(res.statusCode).toEqual(422);
      expect(res.body.message).toEqual(
        "Invalid input passed, please check your data"
      );
    });
  });

  describe("POST /login", () => {
    it("should login successfully", async () => {
      jest.spyOn(bcrypt, "compare").mockResolvedValue(true);
      jest.spyOn(jwt, "sign").mockReturnValue("mocked-jwt-token");
      const res = await request(app).post("/api/users/login").send({
        email: "sshekharjha29@gmail.com",
        password: "Password@123",
      });
      expect(res.statusCode).toEqual(200);
      expect(res.body.token).toEqual("mocked-jwt-token");
    });

    it("should return 401 error when email is not correct", async () => {
      const res = await request(app).post("/api/users/login").send({
        email: "sshekharjha123@gmail.com",
        password: "Password@123",
      });
      expect(res.statusCode).toEqual(401);
      expect(res.body.message).toEqual(
        "Could not identified error, credentials seems to be wrong"
      );
    });

    it("should return 500 error when password is not correct", async () => {
      jest.spyOn(bcrypt, "compare").mockResolvedValue(false);
      jest.spyOn(jwt, "sign").mockReturnValue("mocked-jwt-token");
      const res = await request(app).post("/api/users/login").send({
        email: "sshekharjha29@gmail.com",
        password: "Password@12345",
      });
      expect(res.statusCode).toEqual(500);
      expect(res.body.message).toEqual(
        "Could not log you in yeah, please check your credentials"
      );
    });
  });
});
