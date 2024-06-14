
const paginate = (query, { page, pageSize }) => {
  const offset = page * pageSize;
  const limit = pageSize*1;

  return {
    ...query,
    offset,
    limit,
  };
};

module.exports = {
  paginate
}