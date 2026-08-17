export function AboutMath() {
  return (
    <section className="instrument-section about-section" aria-labelledby="about-heading">
      <div className="section-heading">
        <div>
          <p className="kicker">Foundational theory / BNS–05</p>
          <h2 id="about-heading">The forbidden extension</h2>
        </div>
        <p>A concise mathematical account of bathroom reality and its immovable terminal states.</p>
      </div>

      <div className="about-lede">
        <p>
          The Bathroom Number Scale begins with the childhood convention that <em>number one</em> is peeing and <em>number two</em> is pooping. It then asks the forbidden question: if those are numbers one and two, what are the rest?
        </p>
        <p>
          The result is a signed, tower-exponential taxonomy of bathroom reality. Positive numbers measure defilement, grossness, harm, catastrophe, and damnation. Negative numbers measure cleansing, restoration, transcendence, and salvation. Zero is the neutral act of silently and calmly gazing at oneself in the mirror.
        </p>
      </div>

      <div className="math-grid">
        <article className="theory-card">
          <span className="theory-index">I</span>
          <p className="stage-label">The signed axis</p>
          <h3>Lower is better. Higher is worse.</h3>
          <p>
            The sign indicates direction; the magnitude indicates strength. A shower and a poop oppose one another, but a shower has 27 times the pure magnitude of a poop.
          </p>
          <div className="mini-axis"><span>− good</span><i /><b>0</b><i /><span>+ bad</span></div>
        </article>

        <article className="theory-card">
          <span className="theory-index">II</span>
          <p className="stage-label">The growth law</p>
          <h3>Adjacent integers do not mean adjacent force.</h3>
          <div className="equation-stack">
            <code>G(1) = 1</code>
            <code>G(2) = 3</code>
            <code>G(3) = 81</code>
            <code>G(4) = 81 × 3^27</code>
            <code>G(5) = G(4) × 3^(3^27)</code>
          </div>
          <p>Exponent towers are right-associative. A number 4 is trillions of times worse than a number 3.</p>
        </article>

        <article className="theory-card theory-card--wide">
          <span className="theory-index">III</span>
          <p className="stage-label">Fractional insertion</p>
          <h3>Half-steps are geometric, not arithmetic.</h3>
          <div className="large-equation">
            <span>x = a + (b − a) ×</span>
            <span className="fraction"><b>log(m)</b><i /><b>log(R)</b></span>
          </div>
          <p>
            Cumming lies geometrically between peeing and pooping. Because pooping is 3 times worse than peeing, cumming is √3 times worse than peeing—and pooping is √3 times worse than cumming. Likewise, murder sits halfway through the 3^27 multiplier between vomiting and bathroom nuclear detonation.
          </p>
        </article>
      </div>

      <div className="closed-scale-callout">
        <div><span>−6</span><i /></div>
        <section>
          <p className="stage-label">Axiom of closure</p>
          <h3>Nothing exists beyond the terminals.</h3>
          <p>
            The scale cannot go beyond +6 or −6. Universal eternal hell is the terminal positive state. Universal perfect heaven is the terminal negative state.
          </p>
        </section>
        <div><i /><span>+6</span></div>
      </div>

      <blockquote>
        <p>“I’m going to the bathroom to do a number 4.”</p>
        <footer>Translation: the world’s most powerful nuclear bomb will shortly be detonated in the bathroom.</footer>
      </blockquote>
    </section>
  );
}
