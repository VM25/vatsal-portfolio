import { ScrollStateProvider } from "@/components/world/ScrollState";
import { World } from "@/components/world/World";
import { Home } from "@/components/chapters/Home";
import { Projects } from "@/components/chapters/Projects";
import { Research } from "@/components/chapters/Research";
import { Path } from "@/components/chapters/Path";
import { Contact } from "@/components/chapters/Contact";
import { profile } from "@/data/profile";

/*
  One continuous page over the scene. The chapters are server components; the
  scroll state and the scene are the only client code here. The top bar is the
  minimal one (name and clock); the full bar and menu replace it later.
*/
export default function Page() {
  return (
    <ScrollStateProvider>
      <World />
      <div className="site">
        <header className="top g">
          <a className="mk" href="#top">
            {profile.name}
          </a>
          <span className="clock num" data-clock aria-hidden="true">
            2:04 a.m.
          </span>
        </header>
        <main id="main">
          <Home />
          <Projects />
          <Research />
          <Path />
          <Contact />
        </main>
      </div>
    </ScrollStateProvider>
  );
}
