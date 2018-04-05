//Dependency setup
var express = require("express");
var app = express();
var cookieSession = require('cookie-session')
var express = require('express')
var PORT = process.env.PORT || 8080; // default port 8080
const bodyParser = require("body-parser");
const bcrypt = require('bcrypt');

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({ secret: 'wehadababyitsaboy' }));

//function generateRandomString
//Genetates random 6 length string, used for User ID creation and URL shortning
function generateRandomString() {
  var result = '';
  var chars = '123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    for (var i = 0; i < 6; i++){
      result += chars[Math.floor(Math.random() * chars.length)];
    }
    return result;

//function emailCheck
//compares given arg with all users until it finds a match or runs out of tests.
//Returns Id if present, returns false if not match found, enables both ID
//retrival and boolean checks.
}
function emailCheck(emailaddress){
  for(var id in users){
    if(users[id].email == emailaddress){
      return id;
    }
  }
  return false;
}

//pulls only the URLs belonging only to the user from the main database
function urlsForUser(id){
  var newDatabase = { };
  for(var short in urlDatabase){
    if (urlDatabase[short].user === id){
      newDatabase[short] = urlDatabase[short];
    }
  }
  return newDatabase;
}

//core URL database
var urlDatabase = {
  "b2xVn2": {
    url: "www.lighthouselabs.ca",
    user: "admin"
  }
};

//core user database
var users = {
  "userID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  }
};
//root
app.get("/", (req, res) => {
  res.redirect("http://localhost:8080/urls");
});

//takes in the short url and finds it within the database
//checks for http:// and adds it not present
//redirects to original URL, plus http:// if user did not add during entry
app.get("/u/:shortURL", (req, res) => {
  var longURL = '';
  for (var key in urlDatabase) {
    if (key === req.params.shortURL){
      longURL = urlDatabase[key].url;

      let substring = "http://";
      if (longURL.indexOf(substring) !== 0 ){
        res.redirect(substring + longURL);
      }
      else {
        res.redirect(longURL);
      }
    }
  }
});

//creating new shortend URL:
//checks if user is logged in
//  if not: redirects to registration page
//  if it: sends to creation page.
app.get("/urls/new", (req, res) => {
  if (!users[req.session.user_id]){
    res.redirect("http://localhost:8080/register");
  } else {
  let templateVars = { user: users[req.session.user_id]};
  res.render("urls_new", templateVars);
  }
});

//get url index page
//creates custom database of users specific URLs, will be empty if not logged in
app.get("/urls", (req, res) => {
  let userbase = urlsForUser(req.session.user_id);
  let templateVars = { user: users[req.session.user_id], urls: userbase };
  res.render("urls_index", templateVars);
});

//Post to add shortend URL
//stores long url in database, generates a new shortend url with random key
//sends to index after creation
app.post("/urls", (req, res) => {
  var newShort = generateRandomString();
  urlDatabase[newShort] = { url: req.body.longURL, user: req.session.user_id};
  res.redirect("http://localhost:8080/urls");
});

//Get registration page
app.get("/register", (req, res) => {
  let templateVars = { user: users[req.session.user_id], urls: urlDatabase };
  res.render("urls_reg", templateVars);
});

//Creates new user in user database
//checks to make sure user has entered both an email and password
//  throws 400 if incorrect
//checks to make sure user has entered a non existing email
//  throws 400 if incorrect
//if all pass, hashes password and creates new user objet in user database
//sets cookie to user for identification and redirects to index
app.post("/register", (req, res) => {
  var newUser = 'user'+ generateRandomString();
  if(!req.body.password || !req.body.email){
    res.status(400).send('Bad Request');
  } if (emailCheck(req.body.email)){
    res.status(400).send('Bad Request');;
  } else {
    hashed = bcrypt.hashSync(req.body.password, 10);
  users[newUser] = {
    id: newUser,
    email: req.body.email,
    password: hashed
  }
  req.session.user_id = newUser;
  res.redirect("http://localhost:8080/urls");
  }
});

//Get login page
app.get("/login", (req, res) => {
  res.render("urls_login");
});

//Send Login request
//Checks user credentials
//  if good, sends to index
//  if bad, sends 403 error
app.post("/login", (req, res) => {
  if (emailCheck(req.body.email)){
    var id = emailCheck(req.body.email);
    var check = bcrypt.compareSync(req.body.password, users[id].password);
    if (check){
      req.session.user_id = id;
      res.redirect("http://localhost:8080/urls");
    }
  }else{
  res.status(403).send('Forbidden');
  }
});

//Post logout
//Clears session cookie, preventing user specific information and entry
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("http://localhost:8080/urls");
});

//Post Delete
//Used for deletion of short URLs from the database
//Checks that user is owner of short URL before deletion
//  send 403 error if not owner
//  deletes if owner matches cookie information
app.post("/urls/:id/Delete", (req, res) => {
  if (urlDatabase[req.params.id].user === req.session.user_id){
    delete urlDatabase[req.params.id];
    res.redirect("http://localhost:8080/urls");
  }
  else{
    res.status(403).send('Forbidden');
  }
});

//Post Edit
//Used for editing short URLs in the database
//Checks that user is owner of short URL before editting
//  send 403 error if not owner
//  Edits long URL to new value inputted by the user
app.post("/urls/:id/Edit", (req, res) => {
  if (urlDatabase[req.params.id].user === req.session.user_id){
    // urlDatabase[req.params.id].url = req.session.longURL;
    res.redirect("http://localhost:8080/urls/" + req.params.id);
  }
  else{
    res.status(403).send('Forbidden');
  }
});

//view database
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Get urls/:id
//Based on ID, will check that user is owner or the link, then bring up the
//status page of the URL.
//  info on page: short URL key, original address, delete and edit options
app.get("/urls/:id", (req, res) => {
  if (urlDatabase[req.params.id].user === req.session.user_id){
    let templateVars = { user: users[req.session.user_id], shortURL: req.params.id, urls: urlDatabase};
    res.render("urls_show", templateVars);
  } else{
    res.redirect("http://localhost:8080/register");
  }
});

//Post /urls/:id
//used to update original URLS
app.post("/urls/:id", (req, res) => {
  if(req.body.longURL != ''){
    urlDatabase[req.params.id].url = req.body.longURL;
  }
  res.redirect("http://localhost:8080/urls");
});

//server start for terminal
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});