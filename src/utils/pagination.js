function getPagination(req) {
    let page = req.query.page ? Number(req.query.page) : 1;
    let limit = req.query.limit ? Number(req.query.limit) : 10;

    if (isNaN(page) || page <= 0 || isNaN(limit) || limit <= 0) {
        throw new Error("page and limit must be positive integers");
    }

    if (limit > 50) limit = 50;
    return { page, limit, skip: (page - 1) * limit };
}

module.exports = { getPagination };