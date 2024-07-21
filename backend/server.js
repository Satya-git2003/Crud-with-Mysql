
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2");
const multer = require("multer");
const path = require("path");

const app = express();
app.use(express.json());
app.use(cors());

// Serve static files from the uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "crud"
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed: " + err.stack);
        return;
    }
    console.log("Connected to database.");
});

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

app.get("/", (req, res) => {
    const sql = "SELECT * FROM student";
    db.query(sql, (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database query failed" });
        }
        return res.status(200).json(results);
    });
});

app.post('/create', upload.fields([{ name: 'photo' }, { name: 'resume' }]), (req, res) => {
    const sql = "INSERT INTO student (name, email, photo, resume) VALUES (?, ?, ?, ?)";
    const values = [
        req.body.name,
        req.body.email,
        req.files['photo'][0].filename,
        req.files['resume'][0].filename
    ];
    db.query(sql, values, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Database insert failed" });
        }
        return res.status(200).json({ message: "Student created successfully" });
    });
});

app.put('/update/:id', upload.fields([{ name: 'photo' }, { name: 'resume' }]), (req, res) => {
    const sql = "UPDATE student SET Name = ?, Email = ?, Photo = ?, Resume = ? WHERE ID = ?";
    const values = [
        req.body.name,
        req.body.email,
        req.files['photo'][0].filename,
        req.files['resume'][0].filename,
        req.params.id
    ];

    db.query(sql, values, (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to update student" });
        }
        return res.status(200).json({ message: "Student updated successfully" });
    });
});

app.delete('/student/:id', (req, res) => {
    const sql = "DELETE FROM student WHERE ID = ?";
    const id = req.params.id;

    db.query(sql,[id], (err, data) => {
        if (err)return res.json("Error");
        return res.json(data);
    });
});

app.listen(8082, () => {
    console.log("Listening on port 8082");
});
