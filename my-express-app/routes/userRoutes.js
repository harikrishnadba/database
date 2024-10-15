const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db'); // Adjust the path to your db.js file
const router = express.Router();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;

if (!JWT_SECRET_KEY) {
  console.error('JWT_SECRET_KEY is not defined in .env file');
  throw new Error('JWT_SECRET_KEY is not defined');
}

// User registration route
router.post('/register', async (req, res) => {
  const { username, name, password, gender, location } = req.body;

  if (!username || !name || !password) {
    return res.status(400).send("Username, name, and password are required.");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const selectUserQuery = 'SELECT * FROM users123 WHERE username = $1';
    const result = await db.query(selectUserQuery, [username]);

    if (result.rows.length === 0) {
      const createUserQuery = `
        INSERT INTO users123 (username, name, password, gender, location) 
        VALUES ($1, $2, $3, $4, $5) RETURNING id`;
      const dbResponse = await db.query(createUserQuery, [username, name, hashedPassword, gender, location]);

      res.send(`Created new user with ID: ${dbResponse.rows[0].id}`);
    } else {
      res.status(400).send("User already exists");
    }
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).send("Internal Server Error");
  }
});

// User login route
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send("Username and password are required.");
  }

  try {
    const selectUserQuery = 'SELECT * FROM users123 WHERE username = $1';
    const result = await db.query(selectUserQuery, [username]);

    if (result.rows.length === 0) {
      return res.status(400).send("Invalid User");
    }

    const dbUser = result.rows[0];
    const isPasswordMatched = await bcrypt.compare(password, dbUser.password);

    if (isPasswordMatched) {
      const token = jwt.sign({ username: dbUser.username }, JWT_SECRET_KEY, { expiresIn: '1h' });
      return res.send({ message: "Login Success!", token });
    } else {
      return res.status(400).send("Invalid Password");
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).send("Internal Server Error");
  }
});

module.exports = router;
