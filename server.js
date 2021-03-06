const express = require("express");
const app = express();
const fs = require("fs");
// native node utility
const path = require("path");

const PORT = process.env.PORT || 3001;

var data;
var oldNotes;
//Read the db file fresh
const oldNotesFunc = () => {
  data = fs.readFileSync("./db/db.json");
  oldNotes = JSON.parse(data);
}
oldNotesFunc();

// Helper method for generating unique ids
const uuid = require("./helpers/uuid");

// Middleware
//Allows express to use json format
app.use(express.json());
//Sends request to user from server. Allows post/delete/put to work.
app.use(express.urlencoded({ extended: true }));
//Applies css, html files the correct way. Allows us to read static files.
app.use(express.static("public"));

// GET request for notes page
app.get("/notes", (req, res) => {
  let p = path.join(__dirname, "./public/notes.html");
  res.sendFile(p);
});

app.get("/api/notes", (req, res) => {
  oldNotesFunc();
  res.status(200).json(oldNotes);
});

//GET request for homepage.
//This has to go at the bottom of other get requests because * overrides and means all other /endings.
app.get("*", (req, res) => {
  let p = path.join(__dirname, "./public/index.html");
  res.sendFile(p);
});

// POST request to add a note
app.post("/api/notes", (req, res) => {
  console.info(`${req.method} request received to add a note`);

  // Destructuring assignment for the items in req.body
  const { title, text } = req.body;

  if (title && text) {
    const newNote = {
      title,
      text,
      id: uuid(),
    };

    // oldNotesFunc();
    oldNotes.push(newNote);
    fs.writeFileSync("./db/db.json", JSON.stringify(oldNotes, null, 4));

    res.json(newNote);
  } else {
    res.status(500).json("Missing title and/or text");
  }
});

app.delete("/api/notes/:id", (req, res) => {
  var id = req.params.id;

  // oldNotesFunc();
  const subtractedNotes = oldNotes.filter((oldNote) => {
    return oldNote.id != id;
  });

  fs.writeFileSync("./db/db.json", JSON.stringify(subtractedNotes, null, 4));
  res.json(subtractedNotes);
  console.log(`Note ${id} has been deleted.`)
});


app.listen(PORT, () =>
  console.log(`Express server listening on port ${PORT}.`)
);
