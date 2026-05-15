import { useState, useEffect } from 'react';
import api from './api';

const defaultDoctors = [{ id: 1, name: 'Dr. Preeti Yadav' }];

export default function Contact() {
  const [doctors, setDoctors] = useState(defaultDoctors);
  const [apptData, setApptData] = useState({ name: '', phone: '', email: '', doctorId: '', date: '' });
  const [msgData, setMsgData] = useState({ name: '', email: '', message: '' });

  useEffect(() => {
    api.get('/api/doctors')
      .then(res => setDoctors(res.data.length ? res.data : defaultDoctors))
      .catch(() => setDoctors(defaultDoctors));
  }, []);

  const handleApptSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/appointments', apptData);
      alert('Appointment booked successfully!');
      setApptData({ name: '', phone: '', email: '', doctorId: '', date: '' });
    } catch {
      alert('Failed to book appointment');
    }
  };

  const handleMsgSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/api/messages', msgData);
      alert('Message sent successfully!');
      setMsgData({ name: '', email: '', message: '' });
    } catch {
      alert('Failed to send message');
    }
  };

  return (
    <div>
      <h2 className="section-title">Contact & Book Appointment</h2>
      
      <div className="contact-layout">
        <div className="form-container" style={{ margin: '0' }}>
          <h3>Book an Appointment</h3>
          <form onSubmit={handleApptSubmit}>
            <div className="input-group">
              <label>Name</label>
              <input type="text" required value={apptData.name} onChange={e => setApptData({...apptData, name: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Phone Number</label>
              <input type="tel" required value={apptData.phone} onChange={e => setApptData({...apptData, phone: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Email</label>
              <input type="email" required value={apptData.email} onChange={e => setApptData({...apptData, email: e.target.value})} />
            </div>
            <div className="input-group">
              <label>Choose Doctor</label>
              <select required value={apptData.doctorId} onChange={e => setApptData({...apptData, doctorId: e.target.value})}>
                <option value="">Select Doctor</option>
                {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label>Choose Date</label>
              <input type="date" required value={apptData.date} onChange={e => setApptData({...apptData, date: e.target.value})} />
            </div>
            <button type="submit" className="btn">Submit Appointment</button>
          </form>
        </div>

        <div className="contact-info">
          <div className="form-container" style={{ margin: '0', marginBottom: '2rem' }}>
            <h3>Contact Us</h3>
            <p><strong>Phone:</strong> <a href="tel:9991712690" style={{ textDecoration: 'underline' }}>9991712690</a> , <a href="tel:01274463699" style={{ textDecoration: 'underline' }}>01274-463699</a></p>
            <p><strong>Email:</strong> <a href="mailto:gangadevieyehospital@gmail.com" style={{ textDecoration: 'underline' }}>gangadevieyehospital@gmail.com</a></p>
            <form onSubmit={handleMsgSubmit} style={{ marginTop: '1rem' }}>
              <div className="input-group">
                 <input type="text" placeholder="Your Name" required value={msgData.name} onChange={e => setMsgData({...msgData, name: e.target.value})} />
              </div>
              <div className="input-group">
                 <input type="email" placeholder="Your Email" required value={msgData.email} onChange={e => setMsgData({...msgData, email: e.target.value})} />
              </div>
              <div className="input-group">
                 <textarea placeholder="Message" rows="3" required value={msgData.message} onChange={e => setMsgData({...msgData, message: e.target.value})}></textarea>
              </div>
              <button type="submit" className="btn">Send Message</button>
            </form>
          </div>
          <div className="map-container">
            <iframe 
              src="https://maps.google.com/maps?q=Ganga+Devi+Eye+Hospital+Pvt.+Ltd.,+Konsiwas+Road,+Rewari&t=&z=15&ie=UTF8&iwloc=&output=embed"
              width="100%" 
              height="250" 
              style={{ border: 0, borderRadius: '12px', marginBottom: '0.5rem' }} 
              allowFullScreen="" 
              loading="lazy">
            </iframe>
            <a href="https://maps.app.goo.gl/8cRnptsuexgm6fmi6" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)', fontWeight: '500', textDecoration: 'underline' }}>
              Open in Google Maps
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
