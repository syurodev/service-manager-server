const staffRouter = require("./private/staff.route");

function route(app) {
  app.use("/staff", staffRouter);
}
module.exports = route;
