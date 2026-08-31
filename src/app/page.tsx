import { ColumnRules } from "@/components/site/ColumnRules";
import { RunningHead } from "@/components/site/RunningHead";
import { Colophon } from "@/components/site/Colophon";
import { Masthead } from "@/components/sections/Masthead";
import { Abstract } from "@/components/sections/Abstract";
import { Methods } from "@/components/sections/Methods";
import { Systems } from "@/components/sections/Systems";
import { Record } from "@/components/sections/Record";
import { Research } from "@/components/sections/Research";
import { Correspondence } from "@/components/sections/Correspondence";

/**
 * The record, in order. Everything below the running head is a server
 * component — the only JavaScript that reaches the browser is the running
 * head's scrollspy and the single reveal observer it owns.
 */
export default function Page() {
  return (
    <>
      <ColumnRules />
      <RunningHead />
      <a
        href="#systems"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-ink focus:px-4 focus:py-2 focus:text-paper"
      >
        Skip to the systems
      </a>
      <main className="shell">
        <Masthead />
        <Abstract />
        <Methods />
        <Systems />
        <Record />
        <Research />
        <Correspondence />
        <Colophon />
      </main>
    </>
  );
}
