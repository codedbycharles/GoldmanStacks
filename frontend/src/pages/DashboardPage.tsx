
import { Link } from "react-router";
import "./DashboardPage.css";

export function DashboardPage() {
  return (
    <div className="dashboard">
      <section className="dashboard-intro">
        <p className="eyebrow">GOLDMANSTACKS PRIVATE WEALTH (ALLEGEDLY)</p>

        <h1>Wall Street. Built for you. </h1>

        <p className="dashboard-description">
          Life cover, simplified.
        </p>

        <Link to="/quotes/new" className="primary-button">
          Get started <span aria-hidden="true">→</span>
        </Link>
      </section>

      <section className="dashboard-card">
        <div>
          <p className="eyebrow">THE PAPER TRAIL</p>

          <h2>Your previous calculations</h2>

          <p>
            Your previous life cover estimates, all in one place.
          </p>
        </div>

        <Link to="/quotes" className="text-link">
           View all quotes →
        </Link>
      </section>

      <footer className="disclaimer">
        Built for meme purposes. Not affiliated with Goldman Sachs.
        Definitely not an insurance provider.
      </footer>
    </div>
  );
}
