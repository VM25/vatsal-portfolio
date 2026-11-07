/** Contact (#contact). Its key is always the end of the page, so the label reads 6:12 a.m. */
export function Contact() {
  return (
    <section id="contact" className="sec contact g" data-sec="contact" tabIndex={-1} aria-labelledby="contact-h">
      <div className="veil" />
      <div className="inner" style={{ width: "100%" }}>
        <p className="place" data-time style={{ opacity: 0.85 }}>
          <span data-clocktime>6:12 a.m.</span>
        </p>
        <h2 id="contact-h">Let&apos;s talk</h2>
      </div>
    </section>
  );
}
