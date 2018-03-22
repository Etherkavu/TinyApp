var express = require("express");
var cookieParser = require('cookie-parser');
var app = express();
app.use(cookieParser());
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");

app.set("view engine", "ejs");


function generateRandomString() {
  var result = '';
  var chars = '123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var i = 0; i < 6; i++){
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;
}
function emailCheck(emailaddress){
  for(var id in users){
    if(users[id].email == emailaddress){
      return id;
    }
  }
  return false;
}

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
var users = {
  "userID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  }

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
  let templateVars = { user: users[req.cookies["user_id"]]};
  res.render("urls_new", templateVars);
});

app.get("/urls", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.post("/urls", (req, res) => {
  // console.log(req.body.longURL);  // debug statement to see POST parameters
  var newShort = generateRandomString();
  urlDatabase[newShort] = req.body.longURL;
  res.send(req.body.longURL + " Shortend too: " + newShort);         // Respond with 'Ok' (we will replace this)
});

app.get("/register", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]], urls: urlDatabase };
  res.render("urls_reg", templateVars);
});

app.post("/register", (req, res) => {
  var newUser = 'user'+ generateRandomString();
  if(!req.body.password || !req.body.email){
    res.status(400).send('Bad Request');
  } if (emailCheck(req.body.email)){
    res.status(400).send('Bad Request');;
  } else {
  users[newUser] = req.body.longURL = {
    id: newUser,
    email: req.body.email,
    password: req.body.password
  }
  res.cookie('user_id', newUser);
  res.redirect("http://localhost:8080/urls");
  }
});

app.get("/login", (req, res) => {

  res.render("urls_login");
});

app.post("/login", (req, res) => {
  if (emailCheck(req.body.email)){
    let id = emailCheck(req.body.email);
    if (req.body.password === users[id].password){
    res.cookie('user_id', id);
    res.redirect("http://localhost:8080/urls/urls_login");
    }
  }
  res.status(403).send('Forbidden');;

});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
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
    let templateVars = { user: users[req.cookies["user_id"]], shortURL: req.params.id, urls: urlDatabase};
  res.render("urls_show", templateVars);
});

app.post("/urls/:id", (req, res) => {
  if(req.body.longURL != ''){
    users[req.params.id] = req.body.longURL;
  }
  res.redirect("http://localhost:8080/urls");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});