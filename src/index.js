const express = require("express");
const cors = require("cors");
//const morgan = require("morgan");
const app = express();
const NodeCache = require("node-cache");
const route = require("./routes");
const port = process.env.PORT || 5413;
const db = require("./config/db");

//app.use(morgan("combined"));

//CORS
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

//Connect DB
db.connect();

const cacheOptions = {
  stdTTL: 6000, //6000s
};

const cache = new NodeCache(cacheOptions);

app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(express.json());

app.use((req, res, next) => {
  req.cache = cache;
  next();
});

route(app);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
