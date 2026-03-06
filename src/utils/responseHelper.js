function success(res, data, statusCode = 200) {
  return res.status(statusCode).json({ success: true, data });
}

function fail(res, message, statusCode = 400) {
  return res.status(statusCode).json({ success: false, error: message });
}

function paginate(array, page, limit) {
  const start = (page - 1) * limit;
  const end = start + limit;
  return {
    items: array.slice(start, end),
    total: array.length,
    page,
    totalPages: Math.ceil(array.length / limit),
  };
}

module.exports = { success, fail, paginate };
