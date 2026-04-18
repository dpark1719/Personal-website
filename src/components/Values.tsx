import { useReveal } from '../hooks/useReveal';

const values = [
  { title: 'Unrelenting Curiosity', text: 'Stay hungry to learn. Ask questions. Dig deeper. Never stop wondering why.' },
  { title: 'Relentless Growth', text: 'Embrace discomfort. Get 1% better every day. The grind is the point.' },
  { title: 'Unapologetic Authenticity', text: 'Show up as yourself. Pretending is exhausting and life is too short for it.' },
  { title: 'Unwavering Kindness', text: 'Default to generosity. It costs nothing and means everything.' },
  { title: 'Seek Discomfort', text: 'Growth lives on the other side of easy. Choose the harder path on purpose.' },
  { title: 'F*ck Yeah or No', text: "If it's not a hell yes, it's a no. Be deliberate with time, energy, and attention." },
];

export default function Values() {
  const ref = useReveal<HTMLElement>();

  return (
    <section className="section section-alt" id="values" ref={ref}>
      <div className="container">
        <h2 className="section-title reveal">Values</h2>
        <p className="section-subtitle reveal">Principles I try to live by.</p>
        <div className="values-grid">
          {values.map((v) => (
            <div className="value-card reveal" key={v.title}>
              <h3>{v.title}</h3>
              <p>{v.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
