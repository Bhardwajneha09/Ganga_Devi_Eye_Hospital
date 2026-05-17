const defaultDoctors = [{ id: 1, name: 'Dr. Preeti Yadav' }];
const adminToken = 'gangadevirewari';
const APPOINTMENTS_KEY = 'hospitalLocalAppointments';
const MESSAGES_KEY = 'hospitalLocalMessages';

function getApiBaseURL() {
  const configured = window.__API_BASE_URL__;
  if (configured) return configured;
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return 'http://localhost:5055';
  }
  return '';
}

const apiBaseURL = getApiBaseURL();

function apiUrl(path) {
  return `${apiBaseURL}${path}`;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(apiUrl(path), {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
    ...options,
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const error = new Error(data.error || 'Request failed');
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

function readList(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch {
    return [];
  }
}

function writeList(key, list) {
  localStorage.setItem(key, JSON.stringify(list));
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  }[char]));
}

function icon(name) {
  const icons = {
    eye: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/></svg>',
    phone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.8.7A2 2 0 0 1 22 16.9Z"/></svg>',
    calendar: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 2v4M16 2v4M3 10h18"/><rect x="3" y="4" width="18" height="18" rx="2"/></svg>',
    heart: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z"/></svg>',
    clock: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>',
    shield: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"/><path d="m9 12 2 2 4-4"/></svg>',
  };
  return icons[name] || icons.eye;
}

function getPath() {
  return window.location.pathname === '/' ? '/' : window.location.pathname.replace(/\/$/, '');
}

function navigate(path) {
  window.history.pushState({}, '', path);
  render();
}

function layout(content) {
  document.getElementById('root').innerHTML = `
    <nav>
      <a href="/" class="brand" data-link>
        <img src="/ganga-devi-logo.svg" alt="Ganga Devi Eye Hospital logo" class="brand-logo" />
        <span class="logo">Ganga Devi Eye Hospital</span>
      </a>
      <div class="nav-links">
        <a href="/" data-link>Home</a>
        <a href="/services" data-link>Services</a>
        <a href="/contact" data-link>Contact & Appointment</a>
        <a href="/admin" data-link>Admin Dashboard</a>
      </div>
    </nav>
    <main>${content}</main>
    <footer>
      <p>Ganga Devi Eye Hospital. All Rights Reserved.</p>
      <p>Konsiwas Road near BMG mall Rewari | <a href="tel:9991712690" style="color: inherit; text-decoration: underline;">9991712690</a> | <a href="tel:01274463699" style="color: inherit; text-decoration: underline;">01274-463699</a> | <a href="mailto:gangadevieyehospital@gmail.com" style="color: inherit; text-decoration: underline;">gangadevieyehospital@gmail.com</a></p>
    </footer>
  `;

  document.querySelectorAll('[data-link]').forEach(link => {
    link.addEventListener('click', event => {
      event.preventDefault();
      navigate(link.getAttribute('href'));
    });
  });
}

function renderHome() {
  layout(`
    <section class="hero">
      <h1>Welcome to Ganga Devi Eye Hospital</h1>
      <p>Providing the best, comprehensive and compassionate eye care for you and your family.</p>
      <div style="display: flex; gap: 1rem; justify-content: center; flex-wrap: wrap;">
        <a href="/contact" class="btn btn-with-icon" data-link><span class="btn-icon">${icon('calendar')}</span>Book an Appointment</a>
        <a href="tel:9991712690" class="btn btn-with-icon" style="background: #25D366;"><span class="btn-icon">${icon('phone')}</span>Call Us Now</a>
      </div>
    </section>
    <h2 class="section-title">Why Choose Us?</h2>
    <div class="card-grid">
      <div class="card"><div class="card-icon">${icon('eye')}</div><h3>Expert Care</h3><p>Highly qualified doctors specializing in Cataract, Retina, and Glaucoma treatments.</p></div>
      <div class="card"><div class="card-icon">${icon('shield')}</div><h3>Advanced Tech</h3><p>We use the latest high-tech equipment including OCT and laser machines.</p></div>
      <div class="card"><div class="card-icon">${icon('clock')}</div><h3>24/7 Support</h3><p>Emergency eye care available round the clock for urgent issues.</p></div>
      <div class="card"><div class="card-icon">${icon('phone')}</div><h3>Easy Booking</h3><p>Seamless online appointment scheduling for your convenience.</p></div>
    </div>
  `);
}

function renderServices() {
  const services = [
    ['Cataract Surgery', 'eye'],
    ['Comprehensive Eye Check up', 'shield'],
    ['Retina Care', 'eye'],
    ['Glaucoma Treatment', 'heart'],
    ['Child Eye Care', 'heart'],
    ['Eye Testing', 'eye'],
    ['OCT', 'shield'],
    ['Contact Lenses', 'eye'],
    ['Opticals', 'eye'],
    ['Paediatric Ophthalmology', 'heart'],
    ['Emergency Eye Care', 'clock'],
  ];

  layout(`
    <h2 class="section-title">Our Services</h2>
    <div class="card-grid">
      ${services.map(([service, serviceIcon]) => `
        <div class="card">
          <div class="card-icon">${icon(serviceIcon)}</div>
          <h3>${escapeHtml(service)}</h3>
          <p>Providing the best professional treatments and state-of-the-art facilities for ${escapeHtml(service.toLowerCase())}.</p>
        </div>
      `).join('')}
    </div>
  `);
}

async function loadDoctors() {
  try {
    const doctors = await apiRequest('/api/doctors');
    return doctors.length ? doctors : defaultDoctors;
  } catch {
    return defaultDoctors;
  }
}

function saveLocalAppointment(appointment, doctors) {
  const doctor = doctors.find(item => String(item.id) === String(appointment.doctorId));
  const record = {
    ...appointment,
    id: Date.now(),
    doctorName: doctor?.name || 'Dr. Preeti Yadav',
  };
  writeList(APPOINTMENTS_KEY, [record, ...readList(APPOINTMENTS_KEY)]);
}

function saveLocalMessage(message) {
  writeList(MESSAGES_KEY, [{ ...message, id: Date.now() }, ...readList(MESSAGES_KEY)]);
}

async function renderContact() {
  const doctors = await loadDoctors();
  layout(`
    <h2 class="section-title">Contact & Book Appointment</h2>
    <div class="contact-layout">
      <div class="form-container" style="margin: 0;">
        <h3>Book an Appointment</h3>
        <form id="appointment-form">
          <div class="input-group"><label>Name</label><input name="name" type="text" required /></div>
          <div class="input-group"><label>Phone Number</label><input name="phone" type="tel" required /></div>
          <div class="input-group"><label>Email</label><input name="email" type="email" required /></div>
          <div class="input-group">
            <label>Choose Doctor</label>
            <select name="doctorId" required>
              <option value="">Select Doctor</option>
              ${doctors.map(doctor => `<option value="${doctor.id}">${escapeHtml(doctor.name)}</option>`).join('')}
            </select>
          </div>
          <div class="input-group"><label>Choose Date</label><input name="date" type="date" required /></div>
          <button type="submit" class="btn">Submit Appointment</button>
          <p class="form-note" id="appointment-status" aria-live="polite"></p>
        </form>
      </div>
      <div class="contact-info">
        <div class="form-container" style="margin: 0; margin-bottom: 2rem;">
          <h3>Contact Us</h3>
          <p><strong>Phone:</strong> <a href="tel:9991712690" style="text-decoration: underline;">9991712690</a> , <a href="tel:01274463699" style="text-decoration: underline;">01274-463699</a></p>
          <p><strong>Email:</strong> <a href="mailto:gangadevieyehospital@gmail.com" style="text-decoration: underline;">gangadevieyehospital@gmail.com</a></p>
          <form id="message-form" style="margin-top: 1rem;">
            <div class="input-group"><input name="name" type="text" placeholder="Your Name" required /></div>
            <div class="input-group"><input name="email" type="email" placeholder="Your Email" required /></div>
            <div class="input-group"><textarea name="message" placeholder="Message" rows="3" required></textarea></div>
            <button type="submit" class="btn">Send Message</button>
            <p class="form-note" id="message-status" aria-live="polite"></p>
          </form>
        </div>
        <div class="map-container">
          <iframe src="https://maps.google.com/maps?q=Ganga+Devi+Eye+Hospital+Pvt.+Ltd.,+Konsiwas+Road,+Rewari&t=&z=15&ie=UTF8&iwloc=&output=embed" width="100%" height="250" style="border: 0; border-radius: 12px; margin-bottom: 0.5rem;" allowfullscreen loading="lazy"></iframe>
          <a href="https://maps.app.goo.gl/8cRnptsuexgm6fmi6" target="_blank" rel="noreferrer" style="color: var(--primary); font-weight: 500; text-decoration: underline;">Open in Google Maps</a>
        </div>
      </div>
    </div>
  `);

  document.getElementById('appointment-form').addEventListener('submit', async event => {
    event.preventDefault();
    const status = document.getElementById('appointment-status');
    status.textContent = '';
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await apiRequest('/api/appointments', { method: 'POST', body: JSON.stringify(data) });
      status.textContent = 'Appointment booked successfully. The hospital will receive the notification when SMS is configured.';
      event.currentTarget.reset();
    } catch (error) {
      if (!error.status) {
        saveLocalAppointment(data, doctors);
        status.textContent = 'Backend is offline. Appointment saved locally for admin dashboard testing.';
        event.currentTarget.reset();
        return;
      }
      status.textContent = error.message || 'Failed to book appointment.';
    }
  });

  document.getElementById('message-form').addEventListener('submit', async event => {
    event.preventDefault();
    const status = document.getElementById('message-status');
    status.textContent = '';
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      await apiRequest('/api/messages', { method: 'POST', body: JSON.stringify(data) });
      status.textContent = 'Message sent successfully.';
      event.currentTarget.reset();
    } catch (error) {
      if (!error.status) {
        saveLocalMessage(data);
        status.textContent = 'Backend is offline. Message saved locally for admin dashboard testing.';
        event.currentTarget.reset();
        return;
      }
      status.textContent = error.message || 'Failed to send message.';
    }
  });
}

function rowOrEmpty(rows, colSpan, emptyText) {
  return rows.length ? rows.join('') : `<tr><td colspan="${colSpan}">${emptyText}</td></tr>`;
}

async function renderAdmin(unlocked = false, data = null, note = '') {
  layout(`
    <div style="padding: 2rem 5%;">
      <h2 class="section-title" style="margin-top: 0;">Admin Dashboard</h2>
      <form class="admin-login" id="admin-form">
        <input type="password" name="token" placeholder="Admin token" value="${escapeHtml(localStorage.getItem('adminToken') || '')}" />
        <button class="btn" type="submit">Unlock</button>
        <button class="btn btn-secondary" type="button" id="lock-admin">Lock</button>
      </form>
      <p class="${unlocked && note ? 'admin-help' : 'form-error'}" id="admin-message">${escapeHtml(note || 'Enter the admin token to view appointments, doctor controls, and messages.')}</p>
      <div id="admin-content"></div>
    </div>
  `);

  document.getElementById('admin-form').addEventListener('submit', async event => {
    event.preventDefault();
    const token = new FormData(event.currentTarget).get('token').trim();
    localStorage.setItem('adminToken', token);
    await unlockAdmin(token);
  });
  document.getElementById('lock-admin').addEventListener('click', () => {
    localStorage.removeItem('adminToken');
    renderAdmin(false);
  });

  if (!unlocked || !data) return;

  document.getElementById('admin-content').innerHTML = `
    <div class="card" style="margin-bottom: 2rem; text-align: left;">
      <h3>Manage Appointments</h3>
      <table class="admin-table">
        <thead><tr><th>ID</th><th>Date</th><th>Patient</th><th>Phone</th><th>Doctor</th><th>Action</th></tr></thead>
        <tbody>${rowOrEmpty(data.appointments.map(item => `
          <tr>
            <td>${escapeHtml(item.id)}</td><td>${escapeHtml(item.date)}</td><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.phone)}</td><td>${escapeHtml(item.doctorName)}</td>
            <td><button class="btn btn-danger" data-delete-appointment="${item.id}">Delete</button></td>
          </tr>`), 6, 'No appointments yet.')}</tbody>
      </table>
    </div>
    <div class="card" style="margin-bottom: 2rem; text-align: left;">
      <h3>Manage Doctors</h3>
      <form id="doctor-form" style="display: flex; gap: 1rem; margin-bottom: 1rem;">
        <input style="margin: 0; padding: 0.75rem; flex: 1; min-width: 0;" name="name" type="text" placeholder="Doctor Name & Speciality" />
        <button class="btn" type="submit">Add Doctor</button>
      </form>
      <table class="admin-table">
        <thead><tr><th>ID</th><th>Name</th><th>Action</th></tr></thead>
        <tbody>${rowOrEmpty(data.doctors.map(item => `
          <tr>
            <td>${escapeHtml(item.id)}</td><td>${escapeHtml(item.name)}</td>
            <td><button class="btn btn-danger" data-delete-doctor="${item.id}">Delete</button></td>
          </tr>`), 3, 'No doctors yet.')}</tbody>
      </table>
    </div>
    <div class="card" style="text-align: left;">
      <h3>Manage Messages</h3>
      <table class="admin-table">
        <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Message</th><th>Action</th></tr></thead>
        <tbody>${rowOrEmpty(data.messages.map(item => `
          <tr>
            <td>${escapeHtml(item.id)}</td><td>${escapeHtml(item.name)}</td><td>${escapeHtml(item.email)}</td><td>${escapeHtml(item.message)}</td>
            <td><button class="btn btn-danger" data-delete-message="${item.id}">Delete</button></td>
          </tr>`), 5, 'No messages yet.')}</tbody>
      </table>
    </div>
  `;

  document.querySelectorAll('[data-delete-appointment]').forEach(button => {
    button.addEventListener('click', async () => {
      const id = Number(button.dataset.deleteAppointment);
      if (data.local) {
        writeList(APPOINTMENTS_KEY, readList(APPOINTMENTS_KEY).filter(item => item.id !== id));
        await unlockAdmin(localStorage.getItem('adminToken'));
        return;
      }
      await apiRequest(`/api/admin/appointments/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
      await unlockAdmin(localStorage.getItem('adminToken'));
    });
  });

  document.querySelectorAll('[data-delete-message]').forEach(button => {
    button.addEventListener('click', async () => {
      const id = Number(button.dataset.deleteMessage);
      if (data.local) {
        writeList(MESSAGES_KEY, readList(MESSAGES_KEY).filter(item => item.id !== id));
        await unlockAdmin(localStorage.getItem('adminToken'));
        return;
      }
      await apiRequest(`/api/admin/messages/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` } });
      await unlockAdmin(localStorage.getItem('adminToken'));
    });
  });

  const doctorForm = document.getElementById('doctor-form');
  doctorForm?.addEventListener('submit', async event => {
    event.preventDefault();
    const name = new FormData(event.currentTarget).get('name').trim();
    if (!name) return;
    if (data.local) {
      alert('Start the backend to manage the live doctor list.');
      return;
    }
    await apiRequest('/api/admin/doctors', {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      body: JSON.stringify({ name }),
    });
    await unlockAdmin(localStorage.getItem('adminToken'));
  });

  document.querySelectorAll('[data-delete-doctor]').forEach(button => {
    button.addEventListener('click', async () => {
      if (data.local) {
        alert('Start the backend to manage the live doctor list.');
        return;
      }
      await apiRequest(`/api/admin/doctors/${button.dataset.deleteDoctor}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` },
      });
      await unlockAdmin(localStorage.getItem('adminToken'));
    });
  });
}

async function unlockAdmin(token) {
  if (token !== adminToken) {
    await renderAdmin(false, null, 'Admin token is incorrect.');
    return;
  }

  try {
    const [appointments, doctors, messages] = await Promise.all([
      apiRequest('/api/admin/appointments', { headers: { Authorization: `Bearer ${token}` } }),
      apiRequest('/api/doctors'),
      apiRequest('/api/admin/messages', { headers: { Authorization: `Bearer ${token}` } }),
    ]);
    await renderAdmin(true, { appointments, doctors, messages, local: false }, '');
  } catch {
    await renderAdmin(true, {
      appointments: readList(APPOINTMENTS_KEY),
      doctors: defaultDoctors,
      messages: readList(MESSAGES_KEY),
      local: true,
    }, 'Backend is offline. Showing records saved locally in this browser.');
  }
}

async function render() {
  const path = getPath();
  if (path === '/services') return renderServices();
  if (path === '/contact') return renderContact();
  if (path === '/admin') return renderAdmin(false);
  return renderHome();
}

window.addEventListener('popstate', render);
render();
