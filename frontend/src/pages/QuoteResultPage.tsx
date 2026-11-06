
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router";
import { ApiError } from "../services/api";
import { getQuote } from "../services/quotes";
import type { Quote } from "../types/quote";
import "./QuoteResultPage.css";

const coverFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  maximumFractionDigits: 0,
});

const premiumFormatter = new Intl.NumberFormat("en-GB", {
  style: "currency",
  currency: "GBP",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(value));
}

export function QuoteResultsPage() {
  const { id } = useParams<{ id: string }>();

  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;

    async function loadQuote() {
      try {
        const response = await getQuote(id!);

        if (!cancelled) {
          setQuote(response.quote);
        }
      } catch (error) {
        if (cancelled) return;

        if (error instanceof ApiError && error.status === 404) {
          setError("We couldn't find that quote.");
        } else {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load your quote.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadQuote();

    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="results-message" role="status">
        Loading your results...
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="results-message">
        <h1>Something went wrong.</h1>
        <p>{error || "No quote data was returned."}</p>
        <Link to="/quotes" className="primary-button">
          View my quotes →
        </Link>
      </div>
    );
  }

  const risk = quote.riskBand.toLowerCase();
  const riskClass = ["low", "medium", "high"].includes(risk)
    ? risk
    : "unknown";

  return (
    <div className="results-page">
      <header className="results-header">
        <p className="eyebrow">YOUR RESULTS</p>
        <h1>The numbers are in.</h1>
        <p>Calculated on {formatDate(quote.createdAt)}</p>
      </header>

      <section className="results-main-card">
        <p className="results-label">Recommended life cover</p>

        <p className="results-cover">
          {coverFormatter.format(Number(quote.recommendedCoverAmount))}
        </p>

        <div className="results-stats">
          <div>
            <p className="results-label">Estimated monthly premium</p>
            <p className="results-stat-value">
              {premiumFormatter.format(
                Number(quote.estimatedMonthlyPremium),
              )}
            </p>
          </div>

          <div>
            <p className="results-label">Risk band</p>
            <span className={`risk-badge risk-${riskClass}`}>
              {quote.riskBand}
            </span>
          </div>
        </div>
      </section>

      <section className="results-summary-card">
        <h2>Your recommendation</h2>
        <p>{quote.recommendationSummary}</p>
      </section>

      <div className="results-actions">
        <Link to="/quotes/new" className="primary-button">
          New calculation →
        </Link>

        <Link to="/quotes" className="results-secondary-link">
          View quote history
        </Link>
      </div>

      <p className="results-disclaimer">
        Estimates are illustrative and based on simplified calculations.
        No actual insurance policy or premium is being offered. Get your money up.
        AI is coming for you job. 
      </p>
    </div>
  );
}
