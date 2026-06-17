"use client";

import { useState } from "react";

const ACCESS_KEY = "02e3aaad-8347-495a-9483-b9e3b8092cbe";

const inputCls =
  "w-full rounded-lg border border-line-2 bg-card-2 px-3.5 py-2.5 text-[0.95rem] text-ink placeholder:text-ink-3/70 outline-none transition-colors focus:border-accent focus:ring-2 focus:ring-accent/25";
const labelCls = "mb-1.5 block text-sm font-medium text-ink";

type State = "idle" | "sending" | "ok" | "error";

/** On-brand message channel via Web3Forms. Honeypot-protected. No prefilled values. */
export function ContactForm() {
  const [state, setState] = useState<State>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const form = e.currentTarget;
    const data = new FormData(form);
    data.append("access_key", ACCESS_KEY);
    data.append("subject", "Portfolio message - Vatsal Maniar");
    data.append("from_name", "vatsalmaniar.com");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: data,
      });
      const json = await res.json();
      if (json.success) {
        setState("ok");
        form.reset();
      } else {
        setState("error");
      }
    } catch {
      setState("error");
    }
  }

  if (state === "ok") {
    return (
      <div className="panel flex min-h-[18rem] flex-col justify-center rounded-2xl p-7 text-center">
        <div className="mx-auto grid h-11 w-11 place-items-center rounded-full bg-up/15 text-up">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </div>
        <div className="mt-4 title text-xl">Message received</div>
        <p className="mt-2 text-sm leading-relaxed text-ink-2">
          Thanks for reaching out - I&rsquo;ll reply at the address you left.
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="mx-auto mt-5 rounded-full border border-line-2 bg-card px-4 py-2 text-sm text-ink transition-colors hover:border-ink"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="panel rounded-2xl p-6 sm:p-7">
      <div className="title text-lg">Send a message</div>
      {/* honeypot */}
      <input
        type="checkbox"
        name="botcheck"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className={labelCls}>Name</label>
          <input id="cf-name" name="name" required autoComplete="name" placeholder="Your name" className={inputCls} />
        </div>
        <div>
          <label htmlFor="cf-email" className={labelCls}>Email</label>
          <input id="cf-email" type="email" name="email" required autoComplete="email" placeholder="you@firm.com" className={inputCls} />
        </div>
      </div>
      <div className="mt-4">
        <label htmlFor="cf-message" className={labelCls}>Message</label>
        <textarea id="cf-message" name="message" required rows={4} placeholder="A role, a question, or a problem worth solving." className={`${inputCls} resize-none`} />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={state === "sending"}
          className="inline-flex items-center gap-2 rounded-md bg-ink px-6 py-2.5 text-sm font-semibold uppercase tracking-[0.05em] text-paper transition-colors hover:bg-accent hover:text-accent-ink disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state === "sending" ? (
            <>
              <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-paper/40 border-t-paper" />
              Sending…
            </>
          ) : (
            "Send message"
          )}
        </button>
        {state === "error" && (
          <span className="text-sm text-down">
            Couldn&rsquo;t send - please email directly instead.
          </span>
        )}
      </div>
    </form>
  );
}
