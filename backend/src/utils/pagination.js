
/**
 * Calculates targeted sequences of data
 *
 * @param {string | number} page - Page number
 * @param {string | number} limit - Number of records per page
 * @returns {Object} - An object containing parsed limit and calculated offset
 */
const getPagination = (page, limit) => {
  const pageNumber = parseInt(page, 10) || 1;
  const limitNumber = parseInt(limit, 10) || 10;
  const offset = (pageNumber - 1) * limitNumber;
  return { limit: limitNumber, offset, pageNumber };
};

/**
 * Formats pagination response data
 *
 * @param {Object} data - Data from sequelize findAndCountAll query
 * @param {number} page - Current page number
 * @param {number} limit - Number of records per page
 * @returns {Object} - An object with pagination metadata and the current page's data.
 */
const getPagingData = (data, page, limit) => {
  const { count: totalItems, rows: records } = data;
  const totalPages = Math.ceil(totalItems / limit);
  const currentPage = page;
  return { totalItems, totalPages, currentPage, records };
};

module.exports = { getPagination, getPagingData };