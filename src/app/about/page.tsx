import { SiteHeader } from "../../components/SiteHeader";
import { UnderConstruction } from "../../components/UnderConstruction";

export default function AboutPage() {
  return (
    <div className="min-h-dvh flex flex-col">
      <SiteHeader active="about" />
      <UnderConstruction label="About" />
    </div>
  );
}
