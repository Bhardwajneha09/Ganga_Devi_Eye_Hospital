export default function Services() {
  const services = [
    "Cataract Surgery",
    "Comprehensive Eye Check up",
    "Retina Care",
    "Glaucoma Treatment",
    "Child Eye Care",
    "Eye Testing",
    "OCT",
    "Contact Lenses",
    "Opticals",
    "Paediatric Ophthalmology",
    "Emergency Eye Care"
  ];
  return (
    <div>
      <h2 className="section-title">Our Services</h2>
      <div className="card-grid">
        {services.map((s, index) => (
          <div key={index} className="card">
            <h3>{s}</h3>
            <p>Providing the best professional treatments and state-of-the-art facilities for {s.toLowerCase()}.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
