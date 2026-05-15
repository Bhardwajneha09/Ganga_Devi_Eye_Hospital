import { Link } from 'react-router-dom';
import { Eye, Clock, Phone, Heart } from 'lucide-react';

export default function Home() {
  return (
    <div>
      <section className="hero">
        <h1>Welcome to Ganga Devi Eye Hospital</h1>
        <p>Providing the best, comprehensive and compassionate eye care for you and your family.</p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link to="/contact" className="btn">Book an Appointment</Link>
          <a href="tel:9991712690" className="btn" style={{ background: '#25D366', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Phone size={20} /> Call Us Now
          </a>
        </div>
      </section>
      
      <h2 className="section-title">Why Choose Us?</h2>
      <div className="card-grid">
        <div className="card">
          <Eye size={48} color="var(--primary)" />
          <h3>Expert Care</h3>
          <p>Highly qualified doctors specializing in Cataract, Retina, and Glaucoma treatments.</p>
        </div>
        <div className="card">
          <Heart size={48} color="var(--primary)" />
          <h3>Advanced Tech</h3>
          <p>We use the latest high-tech equipment including OCT and laser machines.</p>
        </div>
        <div className="card">
          <Clock size={48} color="var(--primary)" />
          <h3>24/7 Support</h3>
          <p>Emergency eye care available round the clock for urgent issues.</p>
        </div>
        <div className="card">
          <Phone size={48} color="var(--primary)" />
          <h3>Easy Booking</h3>
          <p>Seamless online appointment scheduling for your convenience.</p>
        </div>
      </div>

      <div style={{ background: 'var(--white)', padding: '4rem 5%', textAlign: 'center' }}>
        <h2 className="section-title" style={{ marginTop: '0' }}>Patient Testimonials</h2>
        <div className="card-grid">
          <div className="card">
            <p>"Fantastic experience. The cataract surgery was completely painless and my vision is perfect now."</p>
            <h4>- Rahul S.</h4>
          </div>
          <div className="card">
            <p>"Very caring staff and professional doctors. My child's eye checkup was handled nicely."</p>
            <h4>- Priya M.</h4>
          </div>
        </div>
      </div>
    </div>
  );
}
