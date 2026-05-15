const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'gangadevirewari';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '';
const databasePath = path.join(__dirname, 'database.sqlite');
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
const allowedOrigins = FRONTEND_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean);
const transporter = process.env.EMAIL_USER && process.env.EMAIL_PASS
    ? nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
        },
    })
    : null;

app.use(cors(allowedOrigins.length ? { origin: allowedOrigins } : undefined));
app.use(express.json({ limit: '20kb' }));

const isBlank = (value) => typeof value !== 'string' || value.trim().length === 0;
const cleanText = (value) => (typeof value === 'string' ? value.trim() : '');
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

function requireAdmin(req, res, next) {
    if (!ADMIN_TOKEN && process.env.NODE_ENV === 'production') {
        return res.status(503).json({ error: 'Admin access is not configured.' });
    }

    if (!ADMIN_TOKEN) return next();

    const authHeader = req.get('authorization') || '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '';

    if (token !== ADMIN_TOKEN) {
        return res.status(401).json({ error: 'Admin token required.' });
    }

    next();
}

const db = new sqlite3.Database(databasePath, (err) => {
    if (err) {
        console.error("Database error: ", err.message);
    } else {
        console.log("Connected to the SQLite database.");
        db.serialize(() => {
            db.run(`CREATE TABLE IF NOT EXISTS doctors (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL
            )`);

            db.run(`CREATE UNIQUE INDEX IF NOT EXISTS idx_doctors_name_unique ON doctors(name)`);

            db.run(
                `INSERT INTO doctors (name)
                 SELECT ?
                 WHERE NOT EXISTS (SELECT 1 FROM doctors WHERE name = ?)`,
                ['Dr. Preeti Yadav', 'Dr. Preeti Yadav']
            );

            db.run(`CREATE TABLE IF NOT EXISTS appointments (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                phone TEXT NOT NULL,
                email TEXT NOT NULL,
                doctorId INTEGER NOT NULL,
                date TEXT NOT NULL,
                FOREIGN KEY(doctorId) REFERENCES doctors(id)
            )`);

            db.run(`CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                email TEXT NOT NULL,
                message TEXT NOT NULL
            )`);
        });
    }
});

// Patients API
app.get('/api/doctors', (req, res) => {
    db.all("SELECT * FROM doctors ORDER BY name", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.post('/api/appointments', (req, res) => {
    const { name, phone, email, doctorId, date } = req.body;
    const values = {
        name: cleanText(name),
        phone: cleanText(phone),
        email: cleanText(email),
        doctorId: Number(doctorId),
        date: cleanText(date),
    };

    if (isBlank(values.name) || isBlank(values.phone) || !isValidEmail(values.email) || !Number.isInteger(values.doctorId) || isBlank(values.date)) {
        return res.status(400).json({ error: 'Please provide a valid name, phone, email, doctor, and date.' });
    }

    db.run(
        "INSERT INTO appointments (name, phone, email, doctorId, date) VALUES (?, ?, ?, ?, ?)",
        [values.name, values.phone, values.email, values.doctorId, values.date],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });

            const doctorQuery = "SELECT name FROM doctors WHERE id = ?";
            db.get(doctorQuery, [values.doctorId], (docErr, docRow) => {
                const docName = docRow ? docRow.name : "Unknown Doctor";
                if (!transporter) return;

                const mailOptions = {
                    from: process.env.EMAIL_USER,
                    to: process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER,
                    subject: `New Appointment Booking: ${values.name}`,
                    text: `A new appointment has been successfully booked!\n\nPatient Details:\nName: ${values.name}\nPhone: ${values.phone}\nEmail: ${values.email}\nDate: ${values.date}\nDoctor: ${docName}`
                };
                transporter.sendMail(mailOptions, (error, info) => {
                    if (error) {
                        console.error('Failed to send notification email:', error.message);
                    } else {
                        console.log('Notification Email sent: ' + info.response);
                    }
                });
            });

            res.json({ id: this.lastID, message: "Appointment booked successfully" });
        }
    );
});

app.post('/api/messages', (req, res) => {
    const { name, email, message } = req.body;
    const values = {
        name: cleanText(name),
        email: cleanText(email),
        message: cleanText(message),
    };

    if (isBlank(values.name) || !isValidEmail(values.email) || isBlank(values.message)) {
        return res.status(400).json({ error: 'Please provide a valid name, email, and message.' });
    }

    db.run(
        "INSERT INTO messages (name, email, message) VALUES (?, ?, ?)",
        [values.name, values.email, values.message],
        function (err) {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ id: this.lastID, message: "Message sent successfully" });
        }
    );
});

// Admin API
app.get('/api/admin/appointments', requireAdmin, (req, res) => {
    const sql = `SELECT appointments.*, doctors.name as doctorName 
                 FROM appointments LEFT JOIN doctors ON appointments.doctorId = doctors.id`;
    db.all(sql, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.delete('/api/admin/appointments/:id', requireAdmin, (req, res) => {
    db.run("DELETE FROM appointments WHERE id = ?", req.params.id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Appointment deleted" });
    });
});

app.get('/api/admin/messages', requireAdmin, (req, res) => {
    db.all("SELECT * FROM messages", [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

app.delete('/api/admin/messages/:id', requireAdmin, (req, res) => {
    db.run("DELETE FROM messages WHERE id = ?", req.params.id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Message deleted" });
    });
});

app.post('/api/admin/doctors', requireAdmin, (req, res) => {
    const name = cleanText(req.body.name);
    if (isBlank(name)) {
        return res.status(400).json({ error: 'Doctor name is required.' });
    }

    db.run("INSERT INTO doctors (name) VALUES (?)", [name], function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, message: "Doctor added" });
    });
});

app.delete('/api/admin/doctors/:id', requireAdmin, (req, res) => {
    db.run("DELETE FROM doctors WHERE id = ?", req.params.id, function (err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ message: "Doctor deleted" });
    });
});

if (fs.existsSync(frontendDistPath)) {
    app.use(express.static(frontendDistPath));
    app.get(/.*/, (req, res) => {
        res.sendFile(path.join(frontendDistPath, 'index.html'));
    });
}

const server = app.listen(PORT, HOST, () => {
    console.log("Server running on " + HOST + ":" + PORT);
});

server.keepAliveTimeout = 65000;
