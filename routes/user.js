const express = require("express");
const jsonschema = require("jsonschema");
const router = new express.Router();
const User = require("../models/user");
const userCreate = require("../schemas/userCreate.json");
const userUpdate = require("../schemas/userUpdate.json");

/** GET / => {users: [user, ...]}  */
router.get("/", async function (req, res, next) {
	try {
		const users = await User.getAll(req.query);
		return res.json({ users });
	} catch (err) {
		return next(err);
	}
});

/** GET /[username]  => {user: user} */
router.get("/:username", async function (req, res, next) {
	try {
		const user = await User.get(req.params.username);
		return res.json({ user });
	} catch (err) {
		return next(err);
	}
});

/** POST /   userData => {user: newUser}  */
router.post("/", async function (req, res, next) {
	try {
		const result = jsonschema.validate(req.body, userCreate);
		if (!result.valid) {
			const listOfErrors = result.errors.map((error) => error.stack);
			return next({
				status: 400,
				error: listOfErrors,
			});
		}

		const user = await User.create(req.body);
		return res.status(201).json({ user });
	} catch (err) {
		return next(err);
	}
});

/** PATCH /[username]   userData => {user: updatedUser}  */
router.patch("/:username", async function (req, res, next) {
	try {
		const validationRes = jsonschema.validate(req.body, userUpdate);
		if (!validationRes.valid) {
			const listOfErrors = validationRes.errors.map((error) => error.stack);
			console.log(listOfErrors);
			return next({
				status: 404,
				errors: listOfErrors,
			});
		}

		const user = await User.update(req.params.username, req.body);
		return res.json({ user });
	} catch (err) {
		return next(err);
	}
});

/** DELETE /[username]   => {message: "User deleted"} */
router.delete("/:username", async function (req, res, next) {
	try {
		await User.delete(req.params.username);
		return res.json({ message: "User deleted" });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
