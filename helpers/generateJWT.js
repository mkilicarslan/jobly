const jwt = require("jsonwebtoken");
const { SECRET_KEY } = require("../config");

function generateJWT(user) {
	const { username, is_admin } = user;
	const payload = { username, is_admin };
	const token = jwt.sign(payload, SECRET_KEY);
	return token;
}

module.exports = generateJWT;
