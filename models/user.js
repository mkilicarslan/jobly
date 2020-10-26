const bcrypt = require("bcrypt");
const db = require("../db");
const sqlForPartialUpdate = require("../helpers/partialUpdate");
const { BCRYPT_WORK_FACTOR } = require("../config");

/** Collection of related methods for user. */
class User {
	/** given an username, return user data with that username:
	 *
	 **/
	static async get(username) {
		const dbQuery = "SELECT * FROM users WHERE username = $1";
		const dbRes = await db.query(dbQuery, [username]);

		if (dbRes.rows.length === 0) {
			throw { message: `There is no user with the username '${username}`, status: 404 };
		}

		return dbRes.rows[0];
	}

	/** Return array of user data:
	 *
	 * => [ userData, ... ]
	 *
	 */
	static async getAll() {
		const usersRes = await db.query(`SELECT * FROM users ORDER BY username`);
		return usersRes.rows;
	}

	/** create user in database from data, return user data:
	 *
	 * {name, num_employees, description, logo_url}
	 *
	 * => {username, name, num_employees, description, logo_url}
	 *
	 * */
	static async create(data) {
		const hashedPassword = await bcrypt.hash(data.password, BCRYPT_WORK_FACTOR);
		const dbQuery = `INSERT INTO users (
            username,
            password,
            first_name,
            last_name,
            email,
            photo_url,
            is_admin)
         VALUES ($1, $2, $3, $4, $5, $6, $7) 
         RETURNING *`;
		const result = await db.query(dbQuery, [
			data.username,
			hashedPassword,
			data.first_name,
			data.last_name,
			data.email,
			data.photo_url,
			data.is_admin === true,
		]);

		return result.rows[0];
	}

	/** Update data with matching username to data, return updated user.
	 * {name, num_employees, description, logo_url}
	 *
	 * => {username, name, num_employees, description, logo_url}
	 *
	 * */
	static async update(username, data) {
		if ("username" in data) {
			throw { message: "Invalid request", status: 404 };
		}

		const { query, values } = sqlForPartialUpdate("users", data, "username", username);
		const result = await db.query(query, values);

		if (result.rows.length === 0) {
			throw { message: `There is no user with a username '${username}`, status: 404 };
		}

		return result.rows[0];
	}

	/** delete user with matching username. Returns undefined. */
	static async delete(username) {
		const dbQuery = "DELETE FROM users WHERE username = $1 RETURNING username";
		const dbRes = await db.query(dbQuery, [username]);

		if (dbRes.rows.length === 0) {
			throw { message: `There is no user with a username '${username}`, status: 404 };
		}
	}

	/** Authenticate: is this username/password valid? Returns boolean. */
	static async authenticate(username, password) {
		const result = await db.query("SELECT password FROM users WHERE username = $1", [username]);
		const user = result.rows[0];
		return user && (await bcrypt.compare(password, user.password)) && user;
	}
}

module.exports = User;
