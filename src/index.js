const express = require("express");
const path = require("path");
const bcrypt = require("bcrypt");
const port = 3000;
const collection = require('./config'); // assuming collection is your User model
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render("login");
});

app.get("/signup", (req, res) => {
    res.render("signup");
});

// Signup route
app.post("/signup", async (req, res) => {
    try {
        const data = {
            name: req.body.name,
            password: req.body.password
        };

        // Check if the user already exists
        const exists = await collection.findOne({ name: data.name });
        if (exists) {
            return res.end("User already exists");
        }

        // Hash the password
        const saltRounds = 12; 
        data.password = await bcrypt.hash(data.password, saltRounds);

        // Insert the new user into the database
        const newUser = new collection(data); // adjust based on your database setup
        await newUser.save();
        console.log("User data inserted");

        // Send a success response
        res.end("Signup successful");
    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ message: "Error occurred during signup", error: error.message });
    }
});

app.post("/login", async (req, res) => {
    try {
        const check = await collection.findOne({ name: req.body.name });
        if (!check) {
            return res.status(404).send("Username not found");
        }

        const isPassword = await bcrypt.compare(req.body.password, check.password);
        if (isPassword) {
            res.render("home");
        } else {
            res.status(401).send("Wrong password");
        }
    } catch (error) {
        console.error("Login Error:", error);
        res.status(500).json({ message: "Wrong details", error: error.message });
    }
});

app.listen(port, () => {
    console.log("Server is running on port", port);
});
