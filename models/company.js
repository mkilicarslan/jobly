const slug = require("slug");
const db = require("../db");
const sqlForPartialUpdate = require("../helpers/partialUpdate");

/** Collection of related methods for companies. */
class Company {
	/** given an handle, return company data with that handle:
	 *
	 **/
	static async get(handle) {
		const dbQuery = "SELECT * FROM company WHERE handle = $1";
		const dbRes = await db.query(dbQuery, [handle]);

		if (dbRes.rows.length === 0) {
			throw { message: `There is no company with the handle '${handle}`, status: 404 };
		}

		const jobsQuery = "SELECT * FROM job WHERE company_handle = $1 ORDER BY date_posted DESC";
		const jobsRes = await db.query(jobsQuery, [handle]);

		const company = dbRes.rows[0];
		company.jobs = jobsRes.rows;

		return company;
	}

	/** Return array of company data:
	 *
	 * => [ companyData, ... ]
	 *
	 */
	static async getAll({ search, min_employees, max_employees }) {
		let dbQuery = "SELECT * FROM company";
		let idx = 1;
		const values = [];
		if (search || min_employees || max_employees) {
			dbQuery = dbQuery.concat(" WHERE ");
		}
		if (search) {
			dbQuery = dbQuery.concat(`name LIKE $${idx} OR handle LIKE $${idx} `);
			values.push("%" + search + "%");
			idx++;
		}
		if (min_employees) {
			dbQuery = dbQuery.concat(idx === 1 ? `num_employees >= $${idx} ` : ` AND num_employees >= $${idx} `);
			values.push(min_employees);
			idx++;
		}
		if (max_employees) {
			dbQuery = dbQuery.concat(idx === 1 ? `num_employees <= $${idx} ` : ` AND num_employees <= $${idx} `);
			values.push(max_employees);
			idx++;
		}

		dbQuery = dbQuery.concat(" ORDER BY name");

		const companiesRes = await db.query(dbQuery, values);
		return companiesRes.rows;
	}

	/** create company in database from data, return company data:
	 *
	 * {name, num_employees, description, logo_url}
	 *
	 * => {handle, name, num_employees, description, logo_url}
	 *
	 * */
	static async create(data) {
		const handle = slug(data.name);
		// while (isHandleOnDB) {
		// 	handle += "-";
		// }
		const dbQuery = `INSERT INTO company (
            handle,
            name,
            num_employees,
            description,
            logo_url) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING handle, name, num_employees, description, logo_url`;
		const result = await db.query(dbQuery, [
			handle,
			data.name,
			data.num_employees,
			data.description,
			data.logo_url,
		]);

		return result.rows[0];
	}

	/** Update data with matching handle to data, return updated company.
	 * {name, num_employees, description, logo_url}
	 *
	 * => {handle, name, num_employees, description, logo_url}
	 *
	 * */
	static async update(handle, data) {
		if ("handle" in data) {
			throw { message: "Invalid request", status: 404 };
		}

		const { query, values } = sqlForPartialUpdate("company", data, "handle", handle);
		const result = await db.query(query, values);

		if (result.rows.length === 0) {
			throw { message: `There is no company with an handle '${handle}`, status: 404 };
		}

		return result.rows[0];
	}

	/** delete company with matching handle. Returns undefined. */
	static async delete(handle) {
		const dbQuery = "DELETE FROM company WHERE handle = $1 RETURNING handle";
		const dbRes = await db.query(dbQuery, [handle]);

		if (dbRes.rows.length === 0) {
			throw { message: `There is no company with an handle '${handle}`, status: 404 };
		}
	}
}

module.exports = Company;
