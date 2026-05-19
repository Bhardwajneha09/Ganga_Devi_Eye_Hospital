const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

const app = express();
const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || '0.0.0.0';
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || 'gangadevirewari';
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || '';
const databasePath = process.env.DATABASE_PATH || path.join(__dirname, 'database.json');
const frontendDistPath = path.join(__dirname, '..', 'frontend', 'dist');
const allowedOrigins = FRONTEND_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean);
const hospitalSmsNumber = process.env.HOSPITAL_SMS_NUMBER || '+919991712690';
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

fs.mkdirSync(path.dirname(databasePath), { recursive: true });

function createDefaultStore() {
    return {
        doctors: [{ id: 1, name: 'Dr. Preeti Yadav' }],
        appointments: [],
        messages: [],
        counters: {
            doctor: 1,
            appointment: 0,
            message: 0,
        },
    };
}

function readStore() {
    if (!fs.existsSync(databasePath)) {
        const store = createDefaultStore();
        writeStore(store);
        return store;
    }

    try {
        const store = JSON.parse(fs.readFileSync(databasePath, 'utf8'));
        store.doctors = Array.isArray(store.doctors) ? store.doctors : [];
        store.appointments = Array.isArray(store.appointments) ? store.appointments : [];
        store.messages = Array.isArray(store.messages) ? store.messages : [];
        store.counters = store.counters || {};
        store.counters.doctor = Number(store.counters.doctor || 0);
        store.counters.appointment = Number(store.counters.appointment || 0);
        store.counters.message = Number(store.counters.message || 0);

        if (!store.doctors.some((doctor) => doctor.name === 'Dr. Preeti Yadav')) {
            store.counters.doctor += 1;
            store.doctors.push({ id: store.counters.doctor, name: 'Dr. Preeti Yadav' });
        }

        store.counters.doctor = Math.max(store.counters.doctor, ...store.doctors.map((doctor) => Number(doctor.id) || 0), 1);
        store.counters.appointment = Math.max(store.counters.appointment, ...store.appointments.map((appointment) => Number(appointment.id) || 0), 0);
        store.counters.message = Math.max(store.counters.message, ...store.messages.map((message) => Number(message.id) || 0), 0);

        writeStore(store);
        return store;
    } catch (err) {
        console.error('Database file could not be read. Creating a new database file:', err.message);
        const store = createDefaultStore();
        writeStore(store);
        return store;
    }
}

function writeStore(store) {
    fs.writeFileSync(databasePath, JSON.stringify(store, null, 2));
}

async function sendAppointmentSms(values, doctorName) {
    const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_FROM_NUMBER } = process.env;

    if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_FROM_NUMBER || !hospitalSmsNumber) {
        console.log('SMS notification skipped: Twilio SMS settings are not configured.');
        return;
    }

    const message = [
        'New appointment booked',
        `Patient: ${values.name}`,
        `Phone: ${values.phone}`,
        `Email: ${values.email}`,
        `Date: ${values.date}`,
        `Doctor: ${doctorName}`,
    ].join('\n');

    const auth = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString('base64');
    const response = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${auth}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
            From: TWILIO_FROM_NUMBER,
            To: hospitalSmsNumber,
            Body: message,
        }),
    });

    if (!response.ok) {
        const details = await response.text();
        throw new Error(`Twilio SMS failed with status ${response.status}: ${details}`);
    }
}

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

app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

readStore();
console.log("Connected to the file database.");

// Patients API
app.get('/api/doctors', (req, res) => {
    const store = readStore();
    res.json([...store.doctors].sort((a, b) => a.name.localeCompare(b.name)));
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

    const store = readStore();
    const doctor = store.doctors.find((item) => Number(item.id) === values.doctorId);
    if (!doctor) return res.status(400).json({ error: 'Selected doctor is not available. Please choose another doctor.' });

    store.counters.appointment += 1;
    const appointment = {
        id: store.counters.appointment,
        name: values.name,
        phone: values.phone,
        email: values.email,
        doctorId: values.doctorId,
        date: values.date,
    };
    store.appointments.push(appointment);
    writeStore(store);

    if (transporter) {
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.NOTIFICATION_EMAIL || process.env.EMAIL_USER,
            subject: `New Appointment Booking: ${values.name}`,
            text: `A new appointment has been successfully booked!\n\nPatient Details:\nName: ${values.name}\nPhone: ${values.phone}\nEmail: ${values.email}\nDate: ${values.date}\nDoctor: ${doctor.name}`
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Failed to send notification email:', error.message);
            } else {
                console.log('Notification Email sent: ' + info.response);
            }
        });
    }

    sendAppointmentSms(values, doctor.name).catch((smsErr) => {
        console.error('Failed to send appointment SMS:', smsErr.message);
    });

    res.json({ id: appointment.id, message: "Appointment booked successfully" });
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

    const store = readStore();
    store.counters.message += 1;
    const savedMessage = {
        id: store.counters.message,
        name: values.name,
        email: values.email,
        message: values.message,
    };
    store.messages.push(savedMessage);
    writeStore(store);
    res.json({ id: savedMessage.id, message: "Message sent successfully" });
});

// Admin API
app.get('/api/admin/appointments', requireAdmin, (req, res) => {
    const store = readStore();
    const rows = store.appointments
        .map((appointment) => ({
            ...appointment,
            doctorName: store.doctors.find((doctor) => Number(doctor.id) === Number(appointment.doctorId))?.name || 'Unknown Doctor',
        }))
        .sort((a, b) => Number(b.id) - Number(a.id));
    res.json(rows);
});

app.delete('/api/admin/appointments/:id', requireAdmin, (req, res) => {
    const store = readStore();
    store.appointments = store.appointments.filter((appointment) => Number(appointment.id) !== Number(req.params.id));
    writeStore(store);
    res.json({ message: "Appointment deleted" });
});

app.get('/api/admin/messages', requireAdmin, (req, res) => {
    const store = readStore();
    res.json([...store.messages].sort((a, b) => Number(b.id) - Number(a.id)));
});

app.delete('/api/admin/messages/:id', requireAdmin, (req, res) => {
    const store = readStore();
    store.messages = store.messages.filter((message) => Number(message.id) !== Number(req.params.id));
    writeStore(store);
    res.json({ message: "Message deleted" });
});

app.post('/api/admin/doctors', requireAdmin, (req, res) => {
    const name = cleanText(req.body.name);
    if (isBlank(name)) {
        return res.status(400).json({ error: 'Doctor name is required.' });
    }

    const store = readStore();
    if (store.doctors.some((doctor) => doctor.name.toLowerCase() === name.toLowerCase())) {
        return res.status(400).json({ error: 'This doctor already exists.' });
    }
    store.counters.doctor += 1;
    const doctor = { id: store.counters.doctor, name };
    store.doctors.push(doctor);
    writeStore(store);
    res.json({ id: doctor.id, message: "Doctor added" });
});

app.delete('/api/admin/doctors/:id', requireAdmin, (req, res) => {
    const store = readStore();
    const doctorId = Number(req.params.id);
    if (store.appointments.some((appointment) => Number(appointment.doctorId) === doctorId)) {
        return res.status(400).json({ error: 'This doctor has appointments and cannot be deleted.' });
    }
    store.doctors = store.doctors.filter((doctor) => Number(doctor.id) !== doctorId);
    writeStore(store);
    res.json({ message: "Doctor deleted" });
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
