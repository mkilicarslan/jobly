const express = require("express");
const jsonschema = require("jsonschema");
const router = new express.Router();
const Company = require("../models/company");
const companyCreate = require("../schemas/companyCreate.json");
const companyUpdate = require("../schemas/companyUpdate.json");

/** GET / => {companies: [company, ...]}  */
router.get("/", async function (req, res, next) {
	try {
		const companies = await Company.getAll(req.query);
		return res.json({ companies });
	} catch (err) {
		return next(err);
	}
});

/** GET /[id]  => {company: company} */
router.get("/:handle", async function (req, res, next) {
	try {
		const company = await Company.get(req.params.handle);
		return res.json({ company });
	} catch (err) {
		return next(err);
	}
});

/** POST /   companyData => {company: newCompany}  */
router.post("/", async function (req, res, next) {
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
router.patch("/:handle", async function (req, res, next) {
	try {
		const validationRes = jsonschema.validate(req.body, companyUpdate);
		if (!validationRes.valid) {
			const listOfErrors = validationRes.errors.map((error) => error.stack);
			console.log(listOfErrors);
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
router.delete("/:handle", async function (req, res, next) {
	try {
		await Company.delete(req.params.handle);
		return res.json({ message: "Deleted" });
	} catch (err) {
		return next(err);
	}
});

module.exports = router;
