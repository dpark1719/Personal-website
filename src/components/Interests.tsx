import { useReveal } from '../hooks/useReveal';

const interests = [
  'Reading', 'Weightlifting', 'Cooking', 'Photography', 'Tech', 'Travel & Exploration',
];

export default function Interests() {
  const ref = useReveal<HTMLElement>();

  return (
    <section className="section" id="interests" ref={ref}>
      <div className="container">
        <h2 className="section-title reveal">Interests &amp; Hobbies</h2>
        <p className="section-subtitle reveal">Things I do when I'm not working.</p>
        <div className="interests-grid">
          {interests.map((tag) => (
            <div className="interest-tag reveal" key={tag}>{tag}</div>
          ))}
        </div>
      </div>
    </section>
  );
}
