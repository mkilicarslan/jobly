const express = require("express");
const jsonschema = require("jsonschema");
const router = new express.Router();
const Job = require("../models/job");
const jobCreate = require("../schemas/jobCreate.json");
const jobUpdate = require("../schemas/jobUpdate.json");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");

/** GET / => {jobs: [job, ...]}  */
router.get("/", ensureLoggedIn, async function (req, res, next) {
	try {
		const jobs = await Job.getAll(req.query);
		return res.json({ jobs });
	} catch (err) {
		return next(err);
	}
});

/** GET /[id]  => {job: job} */
router.get("/:id", ensureLoggedIn, async function (req, res, next) {
	try {
		const job = await Job.get(req.params.id);
		return res.json({ job });
	} catch (err) {
		return next(err);
	}
});

/** POST /   jobData => {job: newjob}  */
router.post("/", ensureAdmin, async function (req, res, next) {
	try {
		const result = jsonschema.validate(req.body, jobCreate);
		if (!result.valid) {
			const listOfErrors = result.errors.map((error) => error.stack);
			return next({
				status: 400,
				error: listOfErrors,
			});
		}

		const job = await Job.create(req.body);
		return res.status(201).json({ job });
	} catch (err) {
		return next(err);
	}
});

/** PATCH /[id]   jobData => {job: updatedjob}  */
router.patch("/:id", ensureAdmin, async function (req, res, next) {
	try {
		const validationRes = jsonschema.validate(req.body, jobUpdate);
		if (!validationRes.valid) {
			const listOfErrors = validationRes.errors.map((error) => error.stack);
			console.log(listOfErrors);
			return next({
				status: 404,
				errors: listOfErrors,
			});
		}

		const job = await Job.update(req.params.id, req.body);
		return res.json({ job });
	} catch (err) {
		return next(err);
	}
});

/** DELETE /[id]   => {message: "Job deleted"} */
router.delete("/:id", ensureAdmin, async function (req, res, next) {
	try {
		await Job.delete(req.params.id);
		return res.json({ message: "Job deleted" });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
