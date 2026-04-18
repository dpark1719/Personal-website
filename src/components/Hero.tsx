export default function Hero() {
  return (
    <section className="hero" id="hero">
      <div className="container">
        <h1 className="hero-name fade-in">Welcome to the world of David Park</h1>
        <p className="hero-tagline fade-in">
          A few things about me &mdash; the books that shaped my thinking, where
          I've been, what I'm working toward, and what keeps me curious.
        </p>
        <a href="#books" className="hero-arrow fade-in" aria-label="Scroll down">
          &#8595;
        </a>
      </div>
    </section>
  );
}
