// server.js
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mysql = require('mysql2');

const app = express();
const port = 3000;

// Use middleware
app.use(cors());
app.use(bodyParser.json());

// Connect to the database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'gym_database/members'
});

connection.connect(err => {
    if (err) {
        console.error('Error connecting to the database:', err);
        return;
    }
    console.log('Connected to MySQL database.');
});

// API Endpoint: Get all workouts
app.get('/api/workouts', (req, res) => {
    connection.query('SELECT * FROM workouts', (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json(results);
    });
});

// API Endpoint: Add a new workout (POST)
app.post('/api/workouts', (req, res) => {
    const { title, description, image } = req.body;
    const query = 'INSERT INTO workouts (title, description, image) VALUES (?, ?, ?)';
    connection.query(query, [title, description, image], (err, results) => {
        if (err) return res.status(500).json({ error: err });
        res.json({ id: results.insertId, title, description, image });
    });
});

// Similarly, add endpoints for updating, deleting workouts, subscriptions, orders, etc.

// Start the server
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
