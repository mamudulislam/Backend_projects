export const healthChecker = (req, res) => {
  res.status(200).json({
    status: "success",
    message: "API is up and running!",
    timestamp: new Date().toISOString(),
  });
};
