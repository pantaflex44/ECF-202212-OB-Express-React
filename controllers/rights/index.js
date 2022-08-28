const { Router, response } = require("express");

const { authenticate } = require("../accounts/middleware");

const { getRights } = require("./services");

const router = Router();

/**
 * GET /api/rights/:page?
 * Get the rights list. Add page number (:page?) to the end of path. No page in path, set the first page to return.
 * Set (:all?) parameter to "all" to list all rights.
 */
router.get("/:all?/:page?", async (req, res = response) => {
    const all = req.params.all || "";
    const page = all === "all" ? 1 : req.params.page || 1;

    let start = all === "all" ? 0 : page * process.env.ITEMS_PER_PAGE - process.env.ITEMS_PER_PAGE;

    const previousPage = page > 1 ? page - 1 : page;
    let ret = {
        previousPage,
        page,
        itemsPerPage: process.env.ITEMS_PER_PAGE
    };

    let rights = await getRights(null, start);
    const hasNextPage = all === "all" ? false : rights.length >= process.env.ITEMS_PER_PAGE;

    if (all === "all") ret = { ...ret, itemsPerPage: rights.length };

    return res.status(200).json({
        ...ret,
        nextPage: hasNextPage ? page + 1 : page,
        rights
    });
});

module.exports = router;
