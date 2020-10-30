const express = require("express");
const jsonschema = require("jsonschema");
const router = new express.Router();
const Company = require("../models/company");
const companyCreate = require("../schemas/companyCreate.json");
const companyUpdate = require("../schemas/companyUpdate.json");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");

/** GET / => {companies: [company, ...]}  */
router.get("/", ensureLoggedIn, async function (req, res, next) {
	try {
		const { search, min_employees, max_employees } = req.query;

		if (min_employees > max_employees) {
			return next({
				status: 400,
				message: "min_employees must not be more than max_employees",
			});
		}

		const companies = await Company.getAll({ search, min_employees, max_employees });
		return res.json({ companies });
	} catch (err) {
		return next(err);
	}
});

/** GET /[id]  => {company: company} */
router.get("/:handle", ensureLoggedIn, async function (req, res, next) {
	try {
		const company = await Company.get(req.params.handle);
		return res.json({ company });
	} catch (err) {
		return next(err);
	}
});

/** POST /   companyData => {company: newCompany}  */
router.post("/", ensureAdmin, async function (req, res, next) {
	try {
		const result = jsonschema.validate(req.body, companyCreate);
		if (!result.valid) {
			const listOfErrors = result.errors.map((error) => error.stack);
			return next({
				status: 400,
				error: listOfErrors,
			});
		}

		const company = await Company.create(req.body);
		return res.status(201).json({ company });
	} catch (err) {
		return next(err);
	}
});

/** PATCH /[id]   companyData => {company: updatedCompany}  */
router.patch("/:handle", ensureAdmin, async function (req, res, next) {
	try {
		const validationRes = jsonschema.validate(req.body, companyUpdate);
		if (!validationRes.valid) {
			const listOfErrors = validationRes.errors.map((error) => error.stack);
			return next({
				status: 404,
				errors: listOfErrors,
			});
		}

		const company = await Company.update(req.params.handle, req.body);
		return res.json({ company });
	} catch (err) {
		return next(err);
	}
});

/** DELETE /[id]   => {message: "Company deleted"} */
router.delete("/:handle", ensureAdmin, async function (req, res, next) {
	try {
		await Company.delete(req.params.handle);
		return res.json({ message: "Deleted" });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
