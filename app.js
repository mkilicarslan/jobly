/** Express app for jobly. */
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const ExpressError = require("./helpers/expressError");

const app = express();

// allow both form-encoded and json body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// allow connections to all routes from any browser
app.use(cors());

/** routes */
const companyRoutes = require("./routes/company");

app.use("/company", companyRoutes);

// add logging system
app.use(morgan("tiny"));

/** 404 handler */
app.use(function (req, res, next) {
	const err = new ExpressError("Not Found", 404);

	// pass the error to the next piece of middleware
	return next(err);
});

/** general error handler */
app.use(function (err, req, res, next) {
	res.status(err.status || 500);
	console.error(err.stack);

	return res.json({
		status: err.status,
		message: err.message,
	});
});

module.exports = app;
