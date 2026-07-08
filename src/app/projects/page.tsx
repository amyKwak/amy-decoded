import { SiteHeader } from "../../components/SiteHeader";
import { UnderConstruction } from "../../components/UnderConstruction";

export default function ProjectsPage() {
  return (
    <div className="min-h-dvh flex flex-col">
      <SiteHeader active="projects" />
      <UnderConstruction label="Projects" />
    </div>
  );
}
