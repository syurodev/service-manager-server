const staffRouter = require("./private/staff.route");
const customerRouter = require("./private/customer.route");
const commodityRouter = require("./private/commodity.route");
const contactRouter = require("./private/contact.route");

function route(app) {
  app.use("/api/staff", staffRouter);
  app.use("/api/customer", customerRouter);
  app.use("/api/commodity", commodityRouter);
  app.use("/api/contact", contactRouter);
}
module.exports = route;
