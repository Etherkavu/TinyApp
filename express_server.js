var express = require("express");
var cookieParser = require('cookie-parser');
var app = express();
app.use(cookieParser());
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");

app.set("view engine", "ejs");


function generateRandomString() {
  var result = '';
  var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var i = 0; i < 6; i++){
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.use(bodyParser.urlencoded({extended: true}));

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/u/:shortURL", (req, res) => {
  var longURL = '';
  for (var key in urlDatabase) {
    if (key === req.params.shortURL){
      longURL = urlDatabase[key];
    }
  }
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  let templateVars = { username: req.cookies["username"]};
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  // console.log(req.body.longURL);  // debug statement to see POST parameters
  var newShort = generateRandomString();
  urlDatabase[newShort] = req.body.longURL;
  res.send(req.body.longURL + " Shortend too: " + newShort);         // Respond with 'Ok' (we will replace this)
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect("http://localhost:8080/urls");
});

app.post("/urls/:id/Delete", (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect("http://localhost:8080/urls");
});

app.post("/urls/:id/Edit", (req, res) => {
  res.redirect("http://localhost:8080/urls/" + req.params.id);
});


app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls/:id", (req, res) => {
  let templateVars = { username: req.cookies["username"], shortURL: req.params.id, urls: urlDatabase};
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  if(req.body.longURL != ''){
    urlDatabase[req.params.id] = req.body.longURL;
  }
  res.redirect("http://localhost:8080/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});