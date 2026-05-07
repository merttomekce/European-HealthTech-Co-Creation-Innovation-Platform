'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  BriefcaseMedical,
  CalendarClock,
  ClipboardList,
  ChevronDown,
  ChevronUp,
  MessageSquareText,
  UserSearch,
  Users,
} from 'lucide-react';
import styles from './landing.module.css';

const capabilityList = [
  {
    key: 'browse',
    title: 'Browse posts',
    meta: 'Scan active clinical needs and engineering projects.',
    summary: 'See new posts, filter by specialty, and jump into the details.',
    bullets: ['Filter by role, expertise, and location', 'Open any post for full context', 'Move into contact from the post view'],
    icon: ClipboardList,
  },
  {
    key: 'message',
    title: 'Message collaborators',
    meta: 'Start direct conversation from any project page.',
    summary: 'Open a thread, ask for details, and keep the collaboration moving.',
    bullets: ['Send a direct message from a project', 'Share context without leaving the app', 'Keep the next step in one thread'],
    icon: MessageSquareText,
  },
  {
    key: 'meeting',
    title: 'Request a meeting',
    meta: 'Move from interest to a scheduled discussion.',
    summary: 'Suggest a time, confirm availability, and move from interest to action.',
    bullets: ['Offer a time window', 'Confirm the meeting state', 'Keep meeting requests visible'],
    icon: CalendarClock,
  },
  {
    key: 'profiles',
    title: 'Review profiles',
    meta: 'See expertise, institution, and public context.',
    summary: 'Check the person behind the post before you reach out.',
    bullets: ['See role, institution, and location', 'Check expertise and background', 'Open public context before contact'],
    icon: UserSearch,
  },
  {
    key: 'post',
    title: 'Post a project',
    meta: 'Share a need, attach context, and ask for help.',
    summary: 'Draft a project, add detail, and publish a clear ask.',
    bullets: ['Write a need with clinical context', 'Add tags and collaboration type', 'Publish so the right people can respond'],
    icon: BriefcaseMedical,
  },
  {
    key: 'replies',
    title: 'Track replies',
    meta: 'Follow open requests and collaboration status.',
    summary: 'See who replied, what changed, and what still needs attention.',
    bullets: ['Follow request status over time', 'Review new replies as they arrive', 'Keep active threads in view'],
    icon: Users,
  },
] as const;

export default function Page() {
  const router = useRouter();
  const [openPreview, setOpenPreview] = useState<(typeof capabilityList)[number]['key'] | null>(null);
  const [displayPreview, setDisplayPreview] = useState<(typeof capabilityList)[number]['key'] | null>(null);

  useEffect(() => {
    if (openPreview) {
      setDisplayPreview(openPreview);
      return;
    }

    const timeout = window.setTimeout(() => {
      setDisplayPreview(null);
    }, 240);

    return () => window.clearTimeout(timeout);
  }, [openPreview]);

  const handleJoinNetwork = () => {
    router.push('/login?from=landing');
  };

  const renderPreview = (key: (typeof capabilityList)[number]['key']) => {
    switch (key) {
      case 'browse':
        return (
          <div className={styles.previewStage}>
            <div className={styles.previewStrip}>
              <span>Oncology</span>
              <span>Emergency</span>
              <span>New today</span>
            </div>
            <div className={styles.previewRow}>
              <div>
                <strong>Remote Patient Monitoring</strong>
                <p>Open post · Berlin, Germany</p>
              </div>
              <span>Active</span>
            </div>
            <div className={styles.previewRow}>
              <div>
                <strong>Sepsis early warning</strong>
                <p>Review request · 8 min ago</p>
              </div>
              <span>New</span>
            </div>
          </div>
        );
      case 'message':
        return (
          <div className={styles.previewStage}>
            <div className={styles.previewBubble}>
              Thanks for the post. I can share a workflow draft and a quick technical outline.
            </div>
            <div className={`${styles.previewBubble} ${styles.previewBubbleAlt}`}>
              Great, send it over and we can line up a follow-up.
            </div>
            <div className={styles.previewChips}>
              <span>Share draft</span>
              <span>Request context</span>
              <span>Follow up later</span>
            </div>
          </div>
        );
      case 'meeting':
        return (
          <div className={styles.previewStage}>
            <div className={styles.previewSlot}>
              <strong>Today, 15:30</strong>
              <p>Suggested meeting window</p>
            </div>
            <div className={styles.previewChips}>
              <span>12:00</span>
              <span>15:30</span>
              <span>18:00</span>
            </div>
            <div className={styles.previewRow}>
              <div>
                <strong>Pending confirmation</strong>
                <p>Visible in the request thread</p>
              </div>
              <span>Ready</span>
            </div>
          </div>
        );
      case 'profiles':
        return (
          <div className={styles.previewStage}>
            <div className={styles.previewProfile}>
              <div className={styles.previewAvatar}>DS</div>
              <div>
                <strong>Dr. Sarah Smith</strong>
                <p>Healthcare Professional · St. Thomas Hospital</p>
              </div>
            </div>
            <div className={styles.previewMetrics}>
              <div>
                <strong>12</strong>
                <span>Projects</span>
              </div>
              <div>
                <strong>6</strong>
                <span>Replies</span>
              </div>
              <div>
                <strong>3</strong>
                <span>Meetups</span>
              </div>
            </div>
          </div>
        );
      case 'post':
        return (
          <div className={styles.previewStage}>
            <div className={styles.previewComposer}>
              <span>Project title</span>
              <strong>Wearable integration for health informatics</strong>
              <p>Need a developer with clinical data experience.</p>
            </div>
            <div className={styles.previewChips}>
              <span>Clinical need</span>
              <span>Engineer search</span>
              <span>Publish</span>
            </div>
          </div>
        );
      case 'replies':
        return (
          <div className={styles.previewStage}>
            <div className={styles.previewTimeline}>
              <div>
                <strong>New reply</strong>
                <p>Interested in working on the integration</p>
              </div>
              <span>Now</span>
            </div>
            <div className={styles.previewTimeline}>
              <div>
                <strong>Meeting requested</strong>
                <p>Waiting for confirmation</p>
              </div>
              <span>Pending</span>
            </div>
            <div className={styles.previewTimeline}>
              <div>
                <strong>Contact exchanged</strong>
                <p>Direct connection logged</p>
              </div>
              <span>Done</span>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const openItem = capabilityList.find((item) => item.key === openPreview) ?? null;
  const displayItem = capabilityList.find((item) => item.key === displayPreview) ?? null;
  const DisplayIcon = displayItem?.icon ?? null;

  return (
    <main className={styles.page}>
      <section className={styles.hero}>
        <div className={styles.copy}>
          <p className={styles.kicker}>HealthAI</p>
          <h1>Build clinical AI with people who know the problem.</h1>
          <p className={styles.lead}>
            Curated network for healthcare professionals and engineers to find relevant projects,
            share context, and co-create practical medical tools.
          </p>

          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={handleJoinNetwork}>
              Join network <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <aside className={styles.feedPanel} aria-label="Platform capabilities">
          <div className={styles.feedShell}>
            <div className={styles.feedHeader}>
              <div>
                <p className={styles.feedEyebrow}>Live previews</p>
                <h2>See what you can do before you join.</h2>
              </div>
            </div>

            <div className={styles.previewViewport}>
              <div className={`${styles.feedList} ${openItem ? styles.feedListHidden : ''}`} aria-hidden={!!openItem}>
                {capabilityList.map(({ key, title, meta, icon: Icon }) => (
                  <article key={key} className={styles.feedItem}>
                    <button
                      type="button"
                      className={styles.feedButton}
                      onClick={() => setOpenPreview(key)}
                      aria-expanded={false}
                      aria-controls={`preview-${key}`}
                    >
                      <div className={styles.feedIcon}>
                        <Icon size={16} aria-hidden="true" />
                      </div>
                      <div className={styles.feedCopy}>
                        <div className={styles.feedTopline}>
                          <ChevronDown size={16} aria-hidden="true" className={styles.feedChevron} />
                        </div>
                        <h3>{title}</h3>
                        <p>{meta}</p>
                      </div>
                    </button>
                  </article>
                ))}
              </div>

              {displayItem ? (
                <article
                  className={`${styles.feedItem} ${styles.feedItemOpen} ${styles.previewSingle} ${!openItem ? styles.previewSingleClosing : ''}`}
                >
                  <button
                    type="button"
                    className={styles.feedButton}
                    onClick={() => setOpenPreview((current) => (current === displayItem.key ? null : displayItem.key))}
                    aria-expanded={true}
                    aria-controls={`preview-${displayItem.key}`}
                  >
                    <div className={styles.feedIcon}>
                      {DisplayIcon ? <DisplayIcon size={16} aria-hidden="true" /> : null}
                    </div>
                    <div className={styles.feedCopy}>
                      <div className={styles.feedTopline}>
                        <ChevronUp size={16} aria-hidden="true" className={styles.feedChevron} />
                      </div>
                      <h3>{displayItem.title}</h3>
                      <p>{displayItem.meta}</p>
                    </div>
                  </button>

                  <div
                    id={`preview-${displayItem.key}`}
                    className={`${styles.previewBody} ${styles.previewBodyOpen}`}
                    aria-hidden="false"
                  >
                    <p className={styles.previewSummary}>{displayItem.summary}</p>
                    <ul className={styles.previewBullets}>
                      {displayItem.bullets.map((bullet) => (
                        <li key={bullet}>{bullet}</li>
                      ))}
                    </ul>
                    {renderPreview(displayItem.key)}
                  </div>
                </article>
              ) : null}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
