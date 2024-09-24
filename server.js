// Import required modules
const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const knex = require('knex');

// Initialize express app
const app = express();

// Set up PostgreSQL connection using knex
const db = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'postgres',
        password: 'test',
        database: 'loginsystem'
    }
});

// Set up static folder (e.g., 'public')
const initialPath = path.join(__dirname, 'public');
app.use(express.static(initialPath));  // Serve static files from 'public'

// Middleware to parse JSON request bodies
app.use(bodyParser.json());

// Serve index.html at /
app.get('/', (req, res) => {
    res.sendFile(path.join(initialPath, 'index.html'));
});

// Serve login.html at /login
app.get('/login', (req, res) => {
    res.sendFile(path.join(initialPath, 'login.html'));
});

// Serve register.html at /register
app.get('/register', (req, res) => {
    res.sendFile(path.join(initialPath, 'register.html'));
});

// Register new user
app.post('/register-user', (req, res) => {
    const { name, email, password } = req.body;

    // Check if all fields are filled
    if (!name || !email || !password) {
        return res.json('Please fill all the fields');
    }

    // Insert user into the database
    db("users").insert({
        name: name,
        email: email,
        password: password
    })
    .returning(["name", "email"])
    .then(data => {
        res.json(data[0]);  // Return the registered user info
    })
    .catch(err => {
        if (err.detail && err.detail.includes('already exists')) {
            res.json('Email already exists');
        } else {
            res.status(500).json('Error registering user');
        }
    });
});

// Login user
app.post('/login-user', (req, res) => {
    const { email, password } = req.body;

    // Validate user credentials
    db.select('name', 'email')
    .from('users')
    .where({ email: email, password: password })
    .then(data => {
        if (data.length) {
            res.json(data[0]);  // Return the logged-in user info
        } else {
            res.json('Email or password is incorrect');
        }
    })
    .catch(err => {
        res.status(500).json('Error logging in');
    });
});

// Start the server on port 3000
app.listen(3000, () => {
    console.log('Listening on port 3000...');
});
