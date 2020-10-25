const db = require("../db");
const sqlForPartialUpdate = require("../helpers/partialUpdate");

/** Collection of related methods for books. */
class Job {
	/** given an id, return job data with that id:
	 *
	 **/
	static async get(id) {
		const dbQuery = "SELECT * FROM job WHERE id = $1";
		const dbRes = await db.query(dbQuery, [id]);

		if (dbRes.rows.length === 0) {
			throw { message: `There is no job with the id '${id}`, status: 404 };
		}

		return dbRes.rows[0];
	}

	/** Return array of book data:
	 *
	 * => [ jobData, ... ]
	 *
	 */
	static async getAll({ search, min_salary, min_equity }) {
		const booksRes = await db.query(`SELECT * FROM job ORDER BY title`);
		return booksRes.rows;
	}

	/** create job in database from data, return job data:
	 *
	 * {name, num_employees, description, logo_url}
	 *
	 * => {id, name, num_employees, description, logo_url}
	 *
	 * */
	static async create(data) {
		const dbQuery = `INSERT INTO job (
            title,
            salary,
            equity,
            company_handle) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`;
		const result = await db.query(dbQuery, [data.title, data.salary, data.equity, data.company_handle]);
		return result.rows[0];
	}

	/** Update data with matching id to data, return updated job.
	 * {name, num_employees, description, logo_url}
	 *
	 * => {id, name, num_employees, description, logo_url}
	 *
	 * */
	static async update(id, data) {
		if ("id" in data) {
			throw { message: "Invalid request", status: 404 };
		}

		const { query, values } = sqlForPartialUpdate("job", data, "id", id);
		const result = await db.query(query, values);

		if (result.rows.length === 0) {
			throw { message: `There is no job with an id '${id}`, status: 404 };
		}

		return result.rows[0];
	}

	/** delete job with matching id. Returns undefined. */
	static async delete(id) {
		const dbQuery = "DELETE FROM job WHERE id = $1 RETURNING id";
		const dbRes = await db.query(dbQuery, [id]);

		if (dbRes.rows.length === 0) {
			throw { message: `There is no job with an id '${id}`, status: 404 };
		}
	}
}

module.exports = Job;
