process.env.NODE_ENV = "test";
const request = require("supertest");
const slug = require("slug");
const app = require("../../app");
const db = require("../../db");
const Company = require("../../models/company");

let company;

beforeEach(async function () {
	await db.query("DELETE FROM job");
	await db.query("DELETE FROM company");

	company = await Company.create({
		name: "My Company",
		description: "First description",
		num_employees: 264,
		logo_url: "https://www",
	});
});

/** GET /company - returns `{companies: [company, ...]}` */
describe("GET /company", function () {
	test("Gets a list of companies", async function () {
		const resp = await request(app).get(`/company`);

		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual({ companies: [company] });
	});
});
// end

/** GET /companies/[handle] - return data about one company: `{company: companyData}` */
describe("GET /company/:handle", function () {
	test("Gets a single company", async function () {
		const resp = await request(app).get(`/company/${company.handle}`);

		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual({ company: { ...company, jobs: [] } });
	});

	test("Responds with 404 if can't find company", async function () {
		const resp = await request(app).get(`/company/0`);
		expect(resp.statusCode).toBe(404);
	});
});
// end

/** POST /company - create company from data; return `{company: company}` */
describe("POST /company", function () {
	test("Creates a new company", async function () {
		const newCompany = {
			name: "My Company 2",
			description: "First description",
			num_employees: 264,
			logo_url: "https://www",
		};
		const resp = await request(app).post(`/company`).send(newCompany);
		expect(resp.statusCode).toBe(201);

		newCompany.handle = slug(newCompany.name);
		expect(resp.body).toEqual({
			company: newCompany,
		});
	});
});
// end

/** PATCH /company/[name] - update company; return `{company: company}` */
describe("PATCH /company/:handle", function () {
	test("Updates a single company", async function () {
		const newDescription = "New Description";
		const resp = await request(app).patch(`/company/${company.handle}`).send({
			description: newDescription,
		});
		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual({
			company: { ...company, description: newDescription },
		});
	});

	test("Responds with 404 if id invalid", async function () {
		const resp = await request(app).patch(`/company/0`);
		expect(resp.statusCode).toBe(404);
	});
});
// end

/** DELETE /company/[name] - delete company,
 *  return `{message: "company deleted"}` */
describe("DELETE /companies/:handle", function () {
	test("Deletes a single a company", async function () {
		const resp = await request(app).delete(`/company/${company.handle}`);
		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual({ message: "Deleted" });
	});
});
// end

afterEach(async function () {
	await db.query("DELETE FROM job");
	await db.query("DELETE FROM company");
});
afterAll(async function () {
	await db.end();
});
