import { Journey } from "@/components/world/Journey";

export default function Page() {
  return (
    <>
      <a
        href="#work"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:bg-saffron focus:px-4 focus:py-2 focus:text-onyx"
      >
        Skip to the work
      </a>
      <Journey />
    </>
  );
}
