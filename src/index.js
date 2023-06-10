const express = require("express");
//const morgan = require("morgan");
const app = express();
const route = require("./routes");
const port = 5000;
const db = require("./config/db");

//app.use(morgan("combined"));

//Connect DB
db.connect();

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

route(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
