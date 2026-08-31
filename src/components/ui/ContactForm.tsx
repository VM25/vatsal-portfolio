"use client";

import { useState } from "react";

type State = "idle" | "sending" | "sent" | "error";

/*
  Web3Forms. The access key is a public, per-form identifier — it is designed to
  sit in client-side code and cannot be used to read anything back, so there is
  no secret here to leak.
*/
const ACCESS_KEY = "02e3aaad-8347-495a-9483-b9e3b8092cbe";

export function ContactForm() {
  const [state, setState] = useState<State>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setState("sending");
    setError("");

    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setState("sent");
        form.reset();
      } else {
        setState("error");
        setError(data.message || "That didn't send. Try again, or email me directly.");
      }
    } catch {
      setState("error");
      setError("That didn't send — check your connection, or email me directly.");
    }
  }

  if (state === "sent") {
    return (
      <div className="card p-6" role="status">
        <p className="h3">Sent.</p>
        <p className="prose mt-3 text-[0.9rem]">
          Thanks — I&rsquo;ll come back to you shortly.
        </p>
        <button
          type="button"
          onClick={() => setState("idle")}
          className="link mt-2"
        >
          Send another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="card p-5 sm:p-6" noValidate={false}>
      <input type="hidden" name="access_key" value={ACCESS_KEY} />
      <input type="hidden" name="subject" value="New message from your portfolio" />
      <input type="hidden" name="from_name" value="Portfolio" />
      {/* Honeypot — bots fill it, people never see it. */}
      <input
        type="checkbox"
        name="botcheck"
        className="hidden"
        style={{ display: "none" }}
        tabIndex={-1}
        autoComplete="off"
      />

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" name="name" type="text" autoComplete="name" />
        <Field label="Email" name="email" type="email" autoComplete="email" />
      </div>

      <div className="mt-4">
        <label htmlFor="message" className="tag block">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={4}
          className="input mt-2 resize-y"
          placeholder="What would you like to talk about?"
        />
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <button type="submit" className="btn" disabled={state === "sending"}>
          {state === "sending" ? "Sending…" : "Send message"}
        </button>
        {state === "error" ? (
          <p role="alert" className="text-[0.85rem] text-toxic">
            {error}
          </p>
        ) : null}
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  type,
  autoComplete,
}: {
  label: string;
  name: string;
  type: string;
  autoComplete: string;
}) {
  return (
    <div>
      <label htmlFor={name} className="tag block">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required
        autoComplete={autoComplete}
        className="input mt-2"
      />
    </div>
  );
}
