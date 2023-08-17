export const NotFound = (req, res, next) => {
  const error = new Error("Not Found - " + req.originalUrl);
  next(error);
};

export const errorHandler = (error, req, res, next) => {
  const message = error.message;
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

  res.status(statusCode).json({ error: message });
};
