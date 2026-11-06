
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { getQuotes } from "../services/quotes";
import type { Quote } from "../types/quote";
import "./QuoteHistoryPage.css";

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
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function getRiskClass(riskBand: string): string {
  const risk = riskBand.toLowerCase();

  return ["low", "medium", "high"].includes(risk)
    ? risk
    : "unknown";
}

export function QuoteHistoryPage() {
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadQuotes() {
      try {
        const response = await getQuotes();

        if (!cancelled) {
          setQuotes(response.quotes);
        }
      } catch (error) {
        if (!cancelled) {
          setError(
            error instanceof Error
              ? error.message
              : "Unable to load your quotes.",
          );
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void loadQuotes();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="history-message" role="status">
        Loading your quotes...
      </div>
    );
  }

  if (error) {
    return (
      <div className="history-message">
        <h1>Couldn't load your quotes.</h1>
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="history-page">
      <header className="history-header">
        <div>
          <p className="eyebrow">THE PAPER TRAIL</p>
          <h1>My quotes</h1>
          <p>
            Your saved life cover calculations, all in one place.
          </p>
        </div>

        <Link to="/quotes/new" className="primary-button">
          New calculation →
        </Link>
      </header>

      {quotes.length === 0 ? (
        <section className="history-empty">
          <h2>No quotes yet.</h2>
          <p>
            Your calculations will appear here once you've
            created your first quote.
          </p>

          <Link to="/quotes/new" className="primary-button">
            Get started →
          </Link>
        </section>
      ) : (
        <div className="history-list">
          {quotes.map((quote) => (
            <Link
              key={quote.id}
              to={`/quotes/${quote.id}`}
              className="history-card"
            >
              <div className="history-card-main">
                <div>
                  <p className="history-card-date">
                    {formatDate(quote.createdAt)}
                  </p>

                  <p className="history-card-label">
                    Recommended life cover
                  </p>

                  <h2>
                    {coverFormatter.format(
                      Number(quote.recommendedCoverAmount),
                    )}
                  </h2>
                </div>

                <span
                  className={`risk-badge risk-${getRiskClass(
                    quote.riskBand,
                  )}`}
                >
                  {quote.riskBand}
                </span>
              </div>

              <div className="history-card-footer">
                <div>
                  <span>Estimated monthly premium</span>
                  <strong>
                    {premiumFormatter.format(
                      Number(quote.estimatedMonthlyPremium),
                    )}
                  </strong>
                </div>

                <span className="history-view">
                  View results →
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
