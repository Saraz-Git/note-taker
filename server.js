const express = require('express');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');
const { clog } = require('./middleware/clog');
const PORT = process.env.PORT || 3029;
const app = express();

//Middleware
app.use(clog);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static('public'));

// GET Route for homepage
app.get('/', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/index.html'))
);

// GET Route for notes page
app.get('/notes', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/notes.html'))
);

//Wildcard route to direct users to the home page
// app.get('*', (req, res) =>
//     res.sendFile(path.join(__dirname, '/public/index.html'))
// );

// GET Route for retrieving all the notes
app.get('/api/notes', (req, res) => {
    const notesData = require('./db/db.json');
    res.json(notesData);
});

// POST Route for submitting new note
app.post('/api/notes', (req, res) => {
    console.log(req.body);
    const { title, text } = req.body;
    if (title && text) {
        const newNote = {
            title,
            text,
            id: uuid.v4(),
        }
        const response = {
            status: 'success',
            body: newNote,
        }
        const notes = require('./db/db.json');
        notes.push(newNote);
        fs.writeFile(`./db/db.json`, JSON.stringify(notes), (err) =>
            err ? console.error(err) : console.log(`Note has been written to JSON file`));
        res.status(201).json(response);
    } else {
        res.status(500).json('Error adding new note');
    }
});

// DELETE Route for a specific note
app.delete('/api/notes/:id', (req, res) => {
    const noteId = req.params.id;//string
    const notes = require('./db/db.json');
    const found = notes.some(note => note.id === noteId);
    if (found) {
        const notesLeft = notes.filter(note => note.id !== noteId);
        fs.writeFile(`./db/db.json`, JSON.stringify(notesLeft), (err) =>
            err ? console.error(err) : console.log(`Note has been deleted`));
        res.status(200).json(notesLeft);
    } else { res.status(500).json('Error deleting note'); }
});

app.listen(PORT, () => console.log(`App listening on port ${PORT}`));