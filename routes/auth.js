const Router = require("express").Router;
const router = new Router();
const User = require("../models/user");
const ExpressError = require("../helpers/expressError");
const generateJWT = require("../helpers/generateJWT");

/** POST /login - login: {username, password} => {token}
 *
 * Make sure to update their last-login!
 *
 **/
router.post("/login", async (req, res, next) => {
	try {
		const { username, password } = req.body;
		const user = await User.authenticate(username, password);
		if (user) {
			const _token = generateJWT(user);
			return res.json({ _token });
		} else {
			throw new ExpressError("Invalid username or password", 400);
		}
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
