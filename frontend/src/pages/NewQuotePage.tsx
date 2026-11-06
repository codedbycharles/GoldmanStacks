import { useState, type SubmitEvent } from "react";
import "./NewQuotePage.css";
import { useNavigate } from "react-router";
import { createQuote } from "../services/quotes";
import type { CreateQuoteRequest } from "../types/quote";

type QuoteForm = {
  age: string;
  dependants: string;
  annualIncome: string;
  partnerAnnualIncome: string;
  monthlyExpenses: string;
  mortgageBalance: string;
  otherDebts: string;
  savings: string;
  existingLifeCover: string;
  incomeReplacementYears: string;
};

const initialForm: QuoteForm = {
  age: "",
  dependants: "",
  annualIncome: "",
  partnerAnnualIncome: "",
  monthlyExpenses: "",
  mortgageBalance: "",
  otherDebts: "",
  savings: "",
  existingLifeCover: "",
  incomeReplacementYears: "",
};

const stepTitles = [
  "About you",
  "Income & expenses",
  "The bigger picture",
  "Final review",
];

type FieldProps = {
  label: string;
  name: keyof QuoteForm;
  value: string;
  onChange: (name: keyof QuoteForm, value: string) => void;
  prefix?: string;
  helper?: string;
  required?: boolean;
};

function formatNumber(value: string): string {
  if (!value) return "";

  return value.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function formatCurrency(value: string): string {
  const amount = Number(value || "0");

  return new Intl.NumberFormat("en-GB", {
    style: "currency",
    currency: "GBP",
    maximumFractionDigits: 0,
  }).format(amount);
}

function NumberField({
  label,
  name,
  value,
  onChange,
  prefix,
  helper,
  required = false,
}: FieldProps) {
  return (
    <div className="quote-field">
      <label htmlFor={name}>{label}</label>

      <div className="quote-input-wrapper">
        {prefix && <span className="quote-prefix">{prefix}</span>}

        <input
          id={name}
          type={prefix ? "text" : "number"}
          min={
            prefix
              ? undefined
              : name === "age" || name === "incomeReplacementYears"
                ? "1"
                : "0"
          }
          max={
            name === "age"
              ? "80"
              : name === "dependants"
                ? "10"
                : name === "incomeReplacementYears"
                  ? "30"
                  : undefined
          }
          step={prefix ? undefined : "1"}
          inputMode="numeric"
          required={required}
          value={prefix ? formatNumber(value) : value}
          onChange={(event) => {
            const input = event.target.value;

            if (prefix) {
              const rawValue = input.replace(/,/g, "");

              if (/^\d*$/.test(rawValue)) {
                onChange(name, rawValue);
              }
            } else {
              onChange(name, input);
            }
          }}
        />
      </div>

      {helper && <p className="quote-helper">{helper}</p>}
    </div>
  );
}

export function NewQuotePage() {
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<QuoteForm>(initialForm);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  function updateField(name: keyof QuoteForm, value: string) {
    setForm((previous) => ({ ...previous, [name]: value }));
    setError("");
  }

  function validateStep(stepToValidate = step): boolean {
    const fieldsByStep: (keyof QuoteForm)[][] = [
      ["age", "dependants"],
      ["annualIncome", "partnerAnnualIncome", "monthlyExpenses"],
      ["mortgageBalance", "otherDebts", "savings", "existingLifeCover"],
      ["incomeReplacementYears"],
    ];

    const requiredFields: (keyof QuoteForm)[] = [
      "age",
      "annualIncome",
      "monthlyExpenses",
      "incomeReplacementYears",
    ];

    const moneyFields: (keyof QuoteForm)[] = [
      "annualIncome",
      "partnerAnnualIncome",
      "monthlyExpenses",
      "mortgageBalance",
      "otherDebts",
      "savings",
      "existingLifeCover",
    ];

    for (const field of fieldsByStep[stepToValidate]) {
      const value = form[field].trim();

      if (value === "") {
        if (requiredFields.includes(field)) {
          setError("Please complete the required fields.");
          return false;
        }

        continue;
      }

      if (moneyFields.includes(field)) {
        if (!/^\d+(\.\d{1,2})?$/.test(value)) {
          setError("Please enter a valid money amount.");
          return false;
        }
      } else {
        const number = Number(value);

        if (!Number.isSafeInteger(number) || number < 0) {
          setError("Please enter a valid whole number.");
          return false;
        }
      }
    }

    if (stepToValidate === 0) {
      const age = Number(form.age);
      const dependants = Number(form.dependants || "0");

      if (age < 18 || age > 80) {
        setError("Age must be between 18 and 80.");
        return false;
      }

      if (dependants > 10) {
        setError("Dependants cannot exceed 10.");
        return false;
      }
    }

    if (stepToValidate === 3) {
      const years = Number(form.incomeReplacementYears);

      if (years < 1 || years > 30) {
        setError("Income replacement years must be between 1 and 30.");
        return false;
      }
    }

    setError("");
    return true;
  }

  function handleNext() {
    if (validateStep()) {
      setStep((current) => Math.min(current + 1, 3));
    }
  }

  function handleBack() {
    setError("");
    setStep((current) => Math.max(current - 1, 0));
  }

  async function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    // Validate every step before sending anything.
    for (let i = 0; i < 4; i++) {
      if (!validateStep(i)) {
        setStep(i);
        return;
      }
    }

    const moneyValue = (value: string) => value.trim() || "0";

    const payload: CreateQuoteRequest = {
      age: Number(form.age),
      dependants: Number(form.dependants || "0"),
      incomeReplacementYears: Number(form.incomeReplacementYears),

      annualIncome: moneyValue(form.annualIncome),
      partnerAnnualIncome: moneyValue(form.partnerAnnualIncome),
      monthlyExpenses: moneyValue(form.monthlyExpenses),
      mortgageBalance: moneyValue(form.mortgageBalance),
      otherDebts: moneyValue(form.otherDebts),
      savings: moneyValue(form.savings),
      existingLifeCover: moneyValue(form.existingLifeCover),
    };

    setSubmitting(true);
    setError("");

    try {
      const response = await createQuote(payload);

      navigate(`/quotes/${response.quote.id}`, { replace: true });
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Unable to calculate your cover. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  const field = (
    name: keyof QuoteForm,
    label: string,
    options: Pick<FieldProps, "prefix" | "helper" | "required"> = {},
  ) => (
    <NumberField
      name={name}
      label={label}
      value={form[name]}
      onChange={updateField}
      {...options}
    />
  );

  return (
    <div className="quote-page">
      <header className="quote-heading">
        <p className="eyebrow">NEW CALCULATION</p>
        <h1>{stepTitles[step]}</h1>
        <p>
          Step {step + 1} of {stepTitles.length}
        </p>
      </header>

      <div
        className="quote-progress"
        role="progressbar"
        aria-label="Questionnaire progress"
        aria-valuenow={step + 1}
        aria-valuemin={1}
        aria-valuemax={4}
      >
        {stepTitles.map((title, index) => (
          <div
            key={title}
            className={`quote-progress-segment ${
              index <= step ? "completed" : ""
            }`}
          />
        ))}
      </div>

      <form className="quote-card" onSubmit={handleSubmit} noValidate>
        {step === 0 && (
          <div className="quote-fields">
            {field("age", "Your age", { required: true })}
            {field("dependants", "Number of dependants", {
              helper: "People who depend on you financially.",
            })}
          </div>
        )}

        {step === 1 && (
          <div className="quote-fields">
            {field("annualIncome", "Your annual income", {
              prefix: "£",
              required: true,
            })}
            {field("partnerAnnualIncome", "Partner's annual income", {
              prefix: "£",
              helper:
                "Recorded for context. Not currently used in the estimate.",
            })}
            {field("monthlyExpenses", "Monthly household expenses", {
              prefix: "£",
              required: true,
            })}
          </div>
        )}

        {step === 2 && (
          <div className="quote-fields">
            {field("mortgageBalance", "Outstanding mortgage", {
              prefix: "£",
            })}
            {field("otherDebts", "Other debts", { prefix: "£" })}
            {field("savings", "Savings", { prefix: "£" })}
            {field("existingLifeCover", "Existing life cover", {
              prefix: "£",
            })}
          </div>
        )}

        {step === 3 && (
          <div className="quote-fields">
            {field("incomeReplacementYears", "Years of income to replace", {
              helper: "How many years of income would you want covered?",
              required: true,
            })}

            <div className="quote-review">
              <h2>Review your details</h2>

              {(
                [
                  ["Age", "age"],
                  ["Dependants", "dependants"],
                  ["Annual income", "annualIncome"],
                  ["Partner income", "partnerAnnualIncome"],
                  ["Monthly expenses", "monthlyExpenses"],
                  ["Mortgage", "mortgageBalance"],
                  ["Other debts", "otherDebts"],
                  ["Savings", "savings"],
                  ["Existing cover", "existingLifeCover"],
                ] as [string, keyof QuoteForm][]
              ).map(([label, name]) => (
                <div className="quote-review-row" key={name}>
                  <span>{label}</span>
                  <strong>
                    {[
                      "annualIncome",
                      "partnerAnnualIncome",
                      "monthlyExpenses",
                      "mortgageBalance",
                      "otherDebts",
                      "savings",
                      "existingLifeCover",
                    ].includes(name)
                      ? formatCurrency(form[name])
                      : form[name] || "0"}
                  </strong>
                </div>
              ))}
            </div>
          </div>
        )}

        {error && (
          <p className="auth-error" role="alert">
            {error}
          </p>
        )}

        <div className="quote-actions">
          {step > 0 && (
            <button
              type="button"
              className="quote-back"
              onClick={handleBack}
              disabled={submitting}
            >
              ← Back
            </button>
          )}

          {step < 3 ? (
            <button
              key="continue"
              type="button"
              className="primary-button"
              onClick={handleNext}
            >
              Continue →
            </button>
          ) : (
            <button
              key="calculate"
              type="submit"
              className="primary-button"
              disabled={submitting}
            >
              {submitting ? "Calculating..." : "Calculate cover →"}
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
