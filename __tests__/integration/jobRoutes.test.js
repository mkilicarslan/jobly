process.env.NODE_ENV = "test";
const request = require("supertest");
const app = require("../../app");
const db = require("../../db");
const Company = require("../../models/company");
const Job = require("../../models/job");

let company, job;
const jobsRootPath = "/jobs";
beforeEach(async function () {
	await db.query("DELETE FROM job");
	await db.query("DELETE FROM company");

	company = await Company.create({
		name: "My Company",
		description: "First description",
		num_employees: 264,
		logo_url: "https://www",
	});

	job = await Job.create({
		title: "web developer",
		salary: 66000.0,
		equity: 0.2,
		company_handle: company.handle,
	});
});

/** GET /jobs - returns `{jobs: [job, ...]}` */
describe("GET /jobs", function () {
	test("Gets a list of jobs", async function () {
		const resp = await request(app).get(jobsRootPath);

		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual({ jobs: [{ ...job, date_posted: expect.any(Date) }] });
	});
});
// end

/** GET /jobs/[id] - return data about one job: `{job: jobData}` */
describe("GET /job/:id", function () {
	test("Gets a single job", async function () {
		const resp = await request(app).get(`${jobsRootPath}/${job.id}`);

		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual({ job });
	});

	test("Responds with 404 if can't find job", async function () {
		const resp = await request(app).get(`${jobsRootPath}/0`);
		expect(resp.statusCode).toBe(404);
	});
});
// end

/** POST /job - create job from data; return `{job: job}` */
describe("POST /job", function () {
	test("Creates a new job", async function () {
		const newJob = {
			title: "Product Manager",
			salary: 166000,
			equity: 0.3,
			company_handle: company.handle,
		};
		const resp = await request(app).post(jobsRootPath).send(newJob);
		expect(resp.statusCode).toBe(201);
		expect(resp.body).toEqual({
			job: { ...newJob, id: expect.any(Number), date_posted: expect.any(Date) },
		});
	});
});
// end

/** PATCH /job/[name] - update job; return `{job: job}` */
describe("PATCH /job/:id", function () {
	test("Updates a single job", async function () {
		const newSalary = 100000;
		const resp = await request(app).patch(`${jobsRootPath}/${job.id}`).send({
			salary: newSalary,
		});
		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual({
			job: { ...job, salary: `${newSalary}`, date_posted: expect.any(Date) },
		});
	});

	test("Responds with 404 if id invalid", async function () {
		const resp = await request(app).patch(`${jobsRootPath}/0`);
		expect(resp.statusCode).toBe(404);
	});
});
// end

/** DELETE /jobs/[id] - delete job,
 *  return `{message: "Job deleted"}` */
describe("DELETE /jobs/:id", function () {
	test("Deletes a single job", async function () {
		const resp = await request(app).delete(`${jobsRootPath}/${job.id}`);
		expect(resp.statusCode).toBe(200);
		expect(resp.body).toEqual({ message: "Job deleted" });
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
