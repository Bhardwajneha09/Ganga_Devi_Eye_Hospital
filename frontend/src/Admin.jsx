import { useState } from 'react';
import api, { setAdminToken } from './api';

export default function Admin() {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [messages, setMessages] = useState([]);
  const [newDoctor, setNewDoctor] = useState('');
  const [adminToken, setAdminTokenValue] = useState(() => localStorage.getItem('adminToken') || '');
  const [error, setError] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const fetchData = async (tokenOverride) => {
    const token = (tokenOverride ?? adminToken).trim();
    if (!token) {
      setError('Enter the admin token to view and manage bookings.');
      setIsUnlocked(false);
      return;
    }

    try {
      setIsLoading(true);
      setError('');
      setAdminToken(token);
      const appts = await api.get('/api/admin/appointments');
      setAppointments(appts.data);
      const docs = await api.get('/api/doctors');
      setDoctors(docs.data);
      const msgs = await api.get('/api/admin/messages');
      setMessages(msgs.data);
      setIsUnlocked(true);
    } catch (err) {
      setIsUnlocked(false);
      if (err.response?.status === 401) {
        setError('Admin token is incorrect. Please check it and try again.');
      } else {
        setError(err.response?.data?.error || 'Unable to load admin data.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    const token = adminToken.trim();
    setAdminTokenValue(token);
    localStorage.setItem('adminToken', token);
    fetchData(token);
  };

  const handleAdminLogout = () => {
    localStorage.removeItem('adminToken');
    setAdminTokenValue('');
    setAdminToken('');
    setError('');
    setIsUnlocked(false);
    setAppointments([]);
    setDoctors([]);
    setMessages([]);
  };

  const handleDeleteAppt = async (id) => {
    if (window.confirm("Delete this appointment?")) {
      await api.delete(`/api/admin/appointments/${id}`);
      fetchData();
    }
  };

  const handleDeleteMsg = async (id) => {
    if (window.confirm("Delete this message?")) {
      await api.delete(`/api/admin/messages/${id}`);
      fetchData();
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (window.confirm("Delete this doctor?")) {
      await api.delete(`/api/admin/doctors/${id}`);
      fetchData();
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    if (!newDoctor) return;
    await api.post('/api/admin/doctors', { name: newDoctor });
    setNewDoctor('');
    fetchData();
  };

  return (
    <div style={{ padding: '2rem 5%' }}>
      <h2 className="section-title" style={{ marginTop: 0 }}>Admin Dashboard</h2>
      <form className="admin-login" onSubmit={handleAdminLogin}>
        <input
          type="password"
          placeholder="Admin token"
          value={adminToken}
          onChange={e => setAdminTokenValue(e.target.value)}
        />
        <button className="btn" type="submit" disabled={isLoading}>{isLoading ? 'Checking...' : 'Unlock'}</button>
        {(adminToken || isUnlocked) && <button className="btn btn-secondary" type="button" onClick={handleAdminLogout}>Lock</button>}
      </form>
      {error && <p className="form-error">{error}</p>}
      {!isUnlocked && !error && (
        <p className="admin-help">Enter the admin token to view appointments, doctor controls, and messages.</p>
      )}
      
      {isUnlocked && <div className="card" style={{ marginBottom: '2rem', textAlign: 'left' }}>
        <h3>Manage Appointments</h3>
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th><th>Date</th><th>Patient</th><th>Phone</th><th>Doctor</th><th>Action</th>
            </tr>
          </thead>
          <tbody>
            {appointments.map(a => (
              <tr key={a.id}>
                <td>{a.id}</td>
                <td>{a.date}</td>
                <td>{a.name}</td>
                <td>{a.phone}</td>
                <td>{a.doctorName}</td>
                <td><button className="btn btn-danger" onClick={() => handleDeleteAppt(a.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}

      {isUnlocked && <div className="card" style={{ marginBottom: '2rem', textAlign: 'left' }}>
        <h3>Manage Doctors</h3>
        <form onSubmit={handleAddDoctor} style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
          <input className="input-group" style={{ margin: 0, padding: '0.75rem', flex: 1 }} type="text" placeholder="Doctor Name & Speciality" value={newDoctor} onChange={e => setNewDoctor(e.target.value)} />
          <button className="btn" type="submit">Add Doctor</button>
        </form>
        <table className="admin-table">
          <thead>
            <tr><th>ID</th><th>Name</th><th>Action</th></tr>
          </thead>
          <tbody>
            {doctors.map(d => (
              <tr key={d.id}>
                <td>{d.id}</td><td>{d.name}</td>
                <td><button className="btn btn-danger" onClick={() => handleDeleteDoctor(d.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}

      {isUnlocked && <div className="card" style={{ textAlign: 'left' }}>
        <h3>Manage Messages</h3>
        <table className="admin-table">
          <thead>
            <tr><th>ID</th><th>Name</th><th>Email</th><th>Message</th><th>Action</th></tr>
          </thead>
          <tbody>
            {messages.map(m => (
              <tr key={m.id}>
                <td>{m.id}</td><td>{m.name}</td><td>{m.email}</td><td>{m.message}</td>
                <td><button className="btn btn-danger" onClick={() => handleDeleteMsg(m.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>}
    </div>
  );
}
