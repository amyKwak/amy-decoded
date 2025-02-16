import Navigation from "../components/Navigation";
import styles from "./projects.module.css";

const Projects = () => {
  return (
    <div className={styles.projects}>
      <Navigation />
      <div className={styles.container}>
        <h1 className={styles.heading}>Projects</h1>
      </div>
    </div>
  );
};
export default Projects;
