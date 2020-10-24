const partialUpdate = require("../../helpers/partialUpdate");

describe("partialUpdate()", () => {
	const logo_url = "https://www.image-url.com";
	const description = "New Description";
	const handle = "my-company";

	it("should generate a proper partial update query with just 1 field", function () {
		const { query, values } = partialUpdate("company", { description }, "handle", handle);

		expect(query).toEqual("UPDATE company SET description=$1 WHERE handle=$2 RETURNING *");
		expect(values).toEqual([description, handle]);
	});

	it("should generate a proper partial update query with multiple fields", function () {
		const { query, values } = partialUpdate("company", { description, logo_url }, "handle", handle);

		expect(query).toEqual("UPDATE company SET description=$1, logo_url=$2 WHERE handle=$3 RETURNING *");
		expect(values).toEqual([description, logo_url, handle]);
	});
});
