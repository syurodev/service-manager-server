const staffRouter = require("./private/staff.route");
const customerRouter = require("./private/customer.route");
const commodityRouter = require("./private/commodity.route");
const contactRouter = require("./private/contact.route");
const orderRouter = require("./private/order.route");
const contractRouter = require("./private/contract.route");
const transactionRouter = require("./private/transaction.route");
// const supportRouter = require("./private/support.route");
const locationRouter = require("./private/location.route");

function route(app) {
  app.use("/api/staff", staffRouter);
  app.use("/api/customer", customerRouter);
  app.use("/api/commodity", commodityRouter);
  app.use("/api/contact", contactRouter);
  app.use("/api/order", orderRouter);
  app.use("/api/contract", contractRouter);
  app.use("/api/transaction", transactionRouter);
  // app.use("/api/support", supportRouter);
  app.use("/api/location", locationRouter);
}
module.exports = route;
