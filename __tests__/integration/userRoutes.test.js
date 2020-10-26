process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../../app");
const db = require("../../db");
const User = require("../../models/user");

let user;
const usersRootPath = "/users";

beforeEach(async function () {
	await db.query("DELETE FROM users");

	user = await User.create({
		username: "user1",
		password: "secretpass",
		first_name: "John",
		last_name: "Doe",
		email: "johndoe@jd.com",
		photo_url: "https://www.photo-url.com",
		is_admin: false,
	});
});

/** GET /users - returns `{users: [user, ...]}` */
describe("GET /users", function () {
	test("Gets a list of users", async function () {
		const resp = await request(app).get(usersRootPath);

		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual({ users: [user] });
	});
});
// end

/** GET /users/[username] - return data about one user: `{user: userData}` */
describe("GET /user/:username", function () {
	test("Gets a single user", async function () {
		const resp = await request(app).get(`${usersRootPath}/${user.username}`);

		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual({ user });
	});

	test("Responds with 404 if can't find user", async function () {
		const resp = await request(app).get(`${usersRootPath}/0`);
		expect(resp.statusCode).toBe(404);
	});
});
// end

/** POST /user - create user from data; return `{user: user}` */
describe("POST /user", function () {
	test("Creates a new user", async function () {
		const newUser = {
			username: "user2",
			password: "secretpass",
			first_name: "John",
			last_name: "Doe",
			email: "johndoe@jd2.com",
			photo_url: "https://www.photo-url.com",
			is_admin: false,
		};
		const resp = await request(app).post(usersRootPath).send(newUser);
		expect(resp.statusCode).toBe(201);
		expect(resp.body).toEqual({ user: newUser });
	});
});
// end

/** PATCH /user/[name] - update user; return `{user: user}` */
describe("PATCH /user/:username", function () {
	test("Updates a single user", async function () {
		const newPhotoUrl = "https://www.new-photo-url.com";
		const resp = await request(app).patch(`${usersRootPath}/${user.username}`).send({
			photo_url: newPhotoUrl,
		});
		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual({
			user: { ...user, photo_url: newPhotoUrl },
		});
	});

	test("Responds with 404 if username invalid", async function () {
		const resp = await request(app).patch(`${usersRootPath}/0`);
		expect(resp.statusCode).toBe(404);
	});
});
// end

/** DELETE /users/[username] - delete user,
 *  return `{message: "User deleted"}` */
describe("DELETE /users/:username", function () {
	test("Deletes a single user", async function () {
		const resp = await request(app).delete(`${usersRootPath}/${user.username}`);
		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual({ message: "User deleted" });
	});
});
// end

afterEach(async function () {
	await db.query("DELETE FROM users");
});
afterAll(async function () {
	await db.end();
});
