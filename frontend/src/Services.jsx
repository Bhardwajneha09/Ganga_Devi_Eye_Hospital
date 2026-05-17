import { Clock, Eye, Heart, ShieldCheck } from 'lucide-react';

export default function Services() {
  const services = [
    { name: "Cataract Surgery", Icon: Eye },
    { name: "Comprehensive Eye Check up", Icon: ShieldCheck },
    { name: "Retina Care", Icon: Eye },
    { name: "Glaucoma Treatment", Icon: Heart },
    { name: "Child Eye Care", Icon: Heart },
    { name: "Eye Testing", Icon: Eye },
    { name: "OCT", Icon: ShieldCheck },
    { name: "Contact Lenses", Icon: Eye },
    { name: "Opticals", Icon: Eye },
    { name: "Paediatric Ophthalmology", Icon: Heart },
    { name: "Emergency Eye Care", Icon: Clock }
  ];
  return (
    <div>
      <h2 className="section-title">Our Services</h2>
      <div className="card-grid">
        {services.map(({ name, Icon }) => (
          <div key={name} className="card">
            <Icon size={48} color="var(--primary)" />
            <h3>{name}</h3>
            <p>Providing the best professional treatments and state-of-the-art facilities for {name.toLowerCase()}.</p>
          </div>
        ))}
      </div>
    </div>
  );
}
