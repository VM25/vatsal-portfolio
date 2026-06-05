"use client";

import { useState } from "react";

const ACCESS_KEY = "02e3aaad-8347-495a-9483-b9e3b8092cbe";

const inputCls =
  "w-full rounded-[4px] border border-line bg-base-2/60 px-3 py-2 text-sm text-ink placeholder:text-ink-faint/60 outline-none transition-colors focus:border-brass/50";
const labelCls =
  "font-mono text-[0.58rem] uppercase tracking-[0.16em] text-ink-faint";

type State = "idle" | "sending" | "ok" | "error";

/** Minimal, on-brand message channel via Web3Forms. Honeypot-protected. */
export function ContactForm() {
  const [state, setState] = useState<State>("idle");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState("sending");
    const form = e.currentTarget;
    const data = new FormData(form);
    data.append("access_key", ACCESS_KEY);
    data.append("subject", "Portfolio message — Vatsal Maniar");
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
      <div className="panel flex h-full flex-col justify-center rounded-[8px] p-6">
        <div className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-up">
          Signal received
        </div>
        <p className="mt-2 text-sm leading-relaxed text-ink-dim">
          Your message is through — I&rsquo;ll reply at the address you left.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="panel rounded-[8px] p-5">
      <div className="font-mono text-[0.6rem] uppercase tracking-[0.16em] text-ink-faint">
        Send a message
      </div>
      {/* honeypot */}
      <input
        type="checkbox"
        name="botcheck"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden
      />
      <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block">
          <span className={labelCls}>Name</span>
          <input name="name" required autoComplete="name" className={`mt-1 ${inputCls}`} />
        </label>
        <label className="block">
          <span className={labelCls}>Email</span>
          <input
            type="email"
            name="email"
            required
            autoComplete="email"
            className={`mt-1 ${inputCls}`}
          />
        </label>
      </div>
      <label className="mt-3 block">
        <span className={labelCls}>Message</span>
        <textarea name="message" required rows={3} className={`mt-1 resize-none ${inputCls}`} />
      </label>
      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={state === "sending"}
          className="rounded-full border border-brass/60 bg-brass px-5 py-2 text-sm font-medium text-[#1a1408] transition-colors hover:bg-brass-bright disabled:opacity-60"
        >
          {state === "sending" ? "Sending…" : "Send"}
        </button>
        {state === "error" && (
          <span className="text-xs text-down">
            Couldn&rsquo;t send — please email instead.
          </span>
        )}
      </div>
    </form>
  );
}
