import { CopyEmail } from "@/components/exhibits/CopyEmail";
import { profile } from "@/data/profile";

const handle = (url: string) => url.replace(/\/$/, "").split("/").pop() ?? url;

/**
 * Contact (#contact). Its key is where its anchor lands: on most layouts, the end of the page.
 * The footer is the page's last element: the document ends at its bottom (see .contact in globals.css).
 */
export function Contact() {
  const { links } = profile;
  return (
    <section id="contact" className="sec contact g" data-sec="contact" tabIndex={-1} aria-labelledby="contact-h">
      <div className="veil" />
      <div className="inner body" style={{ width: "100%" }}>
        <h2 id="contact-h">Let&apos;s talk</h2>
        <p className="st">{profile.status}</p>
        <div className="chan">
          <div className="mail">
            <span className="k">Email</span>
            <div className="v">
              <CopyEmail email={profile.email} />
            </div>
          </div>
          <div>
            <span className="k">LinkedIn</span>
            <a href={links.linkedin} target="_blank" rel="noopener">
              {handle(links.linkedin)} <span aria-hidden="true">↗</span>
              <span className="sr-only">, opens in a new tab</span>
            </a>
            <span />
          </div>
          <div>
            <span className="k">GitHub</span>
            <a href={links.github} target="_blank" rel="noopener">
              {handle(links.github)} <span aria-hidden="true">↗</span>
              <span className="sr-only">, opens in a new tab</span>
            </a>
            <span />
          </div>
          <div>
            <span className="k">Résumé</span>
            <a href={links.resume} target="_blank" rel="noopener">
              PDF <span aria-hidden="true">↗</span>
              <span className="sr-only">, opens in a new tab</span>
            </a>
            <span />
          </div>
        </div>
      </div>
      <footer className="inner foot" style={{ width: "100%" }}>
        <p>© 2026 {profile.name}</p>
      </footer>
    </section>
  );
}
