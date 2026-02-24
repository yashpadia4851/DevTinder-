const express = require("express");

const app = express();

app.get("/hello", (req, res) => {
  res.send("Hello hello");
});

app.get("/about", (req, res) => {
  res.send("Hello about");
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(3000, () => {
  console.log("Server is running on port 3000");
});
