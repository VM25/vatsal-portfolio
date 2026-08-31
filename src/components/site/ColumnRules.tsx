/**
 * The twelve column rules that sit under the whole page, the way a memo's
 * margin rules sit under its text. Fixed and inert; hidden below 1024px, where
 * they would read as noise rather than structure.
 */
export function ColumnRules() {
  return (
    <div className="rules" aria-hidden>
      <div className="rules__inner">
        {Array.from({ length: 12 }, (_, i) => (
          <span key={i} />
        ))}
      </div>
    </div>
  );
}
