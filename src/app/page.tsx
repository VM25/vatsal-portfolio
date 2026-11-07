import { ScrollStateProvider } from "@/components/world/ScrollState";
import { World } from "@/components/world/World";
import { Home } from "@/components/chapters/Home";
import { Projects } from "@/components/chapters/Projects";
import { Research } from "@/components/chapters/Research";
import { Path } from "@/components/chapters/Path";
import { Contact } from "@/components/chapters/Contact";
import { TopBar } from "@/components/site/TopBar";
import { MobileMenu } from "@/components/site/MobileMenu";

/*
  One continuous page over the scene. The chapters are server components; the
  scroll state and the scene are the only client code here. The top bar is sticky
  inside the layout container; the phone menu sits beside it, not in it.
*/
export default function Page() {
  return (
    <ScrollStateProvider>
      <World />
      <div className="site">
        <TopBar />
        <main id="content" tabIndex={-1}>
          <Home />
          <Projects />
          <Research />
          <Path />
          <Contact />
        </main>
      </div>
      <MobileMenu />
    </ScrollStateProvider>
  );
}
