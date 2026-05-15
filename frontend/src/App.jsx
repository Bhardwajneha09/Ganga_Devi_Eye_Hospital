import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './Home';
import Services from './Services';
import Contact from './Contact';
import Admin from './Admin';
import './index.css';

function App() {
  return (
    <BrowserRouter>
      <nav>
        <Link to="/" className="brand">
          <img src="/ganga-devi-logo.svg" alt="Ganga Devi Eye Hospital logo" className="brand-logo" />
          <span className="logo">Ganga Devi Eye Hospital</span>
        </Link>
        <div className="nav-links">
          <Link to="/">Home</Link>
          <Link to="/services">Services</Link>
          <Link to="/contact">Contact & Appointment</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/services" element={<Services />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
      <footer>
        <p>Ganga Devi Eye Hospital. All Rights Reserved.</p>
        <p>Konsiwas Road near BMG mall Rewari | <a href="tel:9991712690" style={{ color: 'inherit', textDecoration: 'underline' }}>9991712690</a> | <a href="tel:01274463699" style={{ color: 'inherit', textDecoration: 'underline' }}>01274-463699</a> | <a href="mailto:gangadevieyehospital@gmail.com" style={{ color: 'inherit', textDecoration: 'underline' }}>gangadevieyehospital@gmail.com</a></p>
      </footer>
    </BrowserRouter>
  );
}
export default App;
