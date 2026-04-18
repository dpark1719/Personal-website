import { useReveal } from '../hooks/useReveal';

const goals = [
  { icon: '○', title: 'Dedicate 30 minutes each day to my own project', text: 'Consistent daily effort compounds — protect the time and show up.' },
  { icon: '○', title: 'Make $1,000 from my own product', text: 'Prove the idea has real value by getting people to pay for it.' },
  { icon: '○', title: 'Read 10 minutes a day', text: 'Small habit, big returns — stay curious and keep learning.' },
  { icon: '○', title: 'Make a journal entry at least once a week', text: 'Reflect regularly to stay grounded and track growth.' },
  { icon: '○', title: 'Workout 3 times a week', text: 'Build discipline and energy through consistent physical training.' },
  { icon: '○', title: 'Travel to 3 new countries', text: 'Broaden perspective through new cultures and experiences.' },
];

export default function Goals() {
  const ref = useReveal<HTMLElement>();

  return (
    <section className="section" id="goals" ref={ref}>
      <div className="container">
        <h2 className="section-title reveal">Goals</h2>
        <p className="section-subtitle reveal">What I'm working toward, near and far.</p>
        <div className="goals-grid">
          {goals.map((g) => (
            <div className="goal-card reveal" key={g.title}>
              <span className="goal-icon">{g.icon}</span>
              <div>
                <h3>{g.title}</h3>
                <p>{g.text}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
