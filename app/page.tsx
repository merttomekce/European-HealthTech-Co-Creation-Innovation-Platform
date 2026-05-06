import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import styles from './landing.module.css';

const projects = [
  { area: 'Critical care', title: 'Sepsis early warning', meta: '16 collaborators' },
  { area: 'Nephrology', title: 'Home dialysis companion', meta: '9 collaborators' },
  { area: 'Emergency medicine', title: 'Triage note assistant', meta: '24 collaborators' },
  { area: 'Neurology', title: 'Stroke rehab tracker', meta: '12 collaborators' },
];

export default function Page() {
  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.copy}>
          <p className={styles.kicker}>HealthAI</p>
          <h1>Build clinical AI with people who know problem.</h1>
          <p className={styles.lead}>
            Curated network for healthcare professionals and engineers to find relevant projects,
            share context, and co-create practical medical tools.
          </p>

          <div className={styles.actions}>
            <Link href="/login" className={styles.primary}>
              Join network <ArrowRight size={18} />
            </Link>
            <Link href="/dashboard" className={styles.secondary}>
              Explore projects
            </Link>
          </div>
        </div>

        <div className={styles.visual} aria-hidden="true">
          {projects.map((project) => (
            <article key={project.title} className={styles.projectCard}>
              <div className={styles.projectGlow} />
              <div className={styles.projectBody}>
                <p>{project.area}</p>
                <h2>{project.title}</h2>
                <span>{project.meta}</span>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
