const express = require('express');
const path = require('path');
const fs = require('fs/promises');
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

// GET Route for retrieving all the notes
app.get('/api/notes', async (req, res) => {
    const dataString = await fs.readFile('./db/db.json', { encoding: 'utf8' });
    const notesData = JSON.parse(dataString);
    res.json(notesData);
});

// POST Route for submitting new note
app.post('/api/notes', async (req, res) => {
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

        const dataString = await fs.readFile('./db/db.json', { encoding: 'utf8' });
        let notes = JSON.parse(dataString);
        notes.push(newNote);
        await fs.writeFile(`./db/db.json`, JSON.stringify(notes));
        res.status(201).json(response);
    } else {
        res.status(500).json('Error adding new note');
    }
});

// DELETE Route for a specific note
app.delete('/api/notes/:id', async (req, res) => {
    const noteId = req.params.id;
    const dataString = await fs.readFile('./db/db.json', { encoding: 'utf8' });
    const notes = JSON.parse(dataString);
    const found = notes.some(note => note.id === noteId);
    if (found) {
        const notesLeft = notes.filter(note => note.id !== noteId);
        await fs.writeFile(`./db/db.json`, JSON.stringify(notesLeft));
        res.status(200).json(notesLeft);
    } else { res.status(500).json('Error deleting note'); }
});

//Wildcard route to direct users to the home page
app.get('*', (req, res) =>
    res.sendFile(path.join(__dirname, '/public/index.html'))
);

app.listen(PORT, () => console.log(`App listening on port ${PORT}`));