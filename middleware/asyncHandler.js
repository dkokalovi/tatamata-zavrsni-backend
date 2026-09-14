// Omata svaku async route funkciju - ako baci gresku (npr. Mongo upit padne),
// automatski je proslijedi Express-ovom error-handling middlewareu (next(err))
// umjesto da ruta ostane bez try/catch i sruši server neuhvacenim rejectom.
export default function asyncHandler(fn) {
  return function (req, res, next) {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}
