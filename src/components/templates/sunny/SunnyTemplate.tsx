export type SunnyTemplateData = {
  assets: {
    bg: string;
    flower3: string;
    couple: string;
    flower2: string;
    flower1: string;
    coverImage: string;
    cloud3: string;
    cloud4: string;
    flowerDecor?: string;
    flowerDecor2?: string;
  };
  cover: {
    title: string;
    subtitle: string;
    date: string;
  };
  verse: {
    text: string;
    source: string;
  };
  bride: {
    nickname: string;
    fullName: string;
    parents: string;
    instagram: string;
    instagramLink: string;
  };
  groom: {
    nickname: string;
    fullName: string;
    parents: string;
    instagram: string;
    instagramLink: string;
  };
  events: {
    matrimony: {
      title: string;
      date: string;
      time: string;
      locationName: string;
      locationAddress: string;
      mapLink: string;
    };
    reception: {
      title: string;
      date: string;
      time: string;
      locationName: string;
      locationAddress: string;
      mapLink: string;
    };
  };
  dresscode: {
    title: string;
    description: string;
    colors: string[];
  };
  quote: {
    text: string;
  };
  rsvp: {
    title: string;
    subtitle: string;
    countdown: { days: number; hours: number; minutes: number; seconds: number };
    comments: { name: string; text: string; time: string }[];
  };
  story: {
    title: string;
    bgImage: string;
    timeline: { title: string; description: string }[];
  };
  gallery: {
    title: string;
    photos: { src: string; type: 'fullWidth' | 'tall' }[];
  };
  gift: {
    title: string;
    description: string;
  };
  closing: {
    message: string;
    couplePhoto: string;
    coupleName: string;
  };
  footer: {
    brand: string;
    phone: string;
    website: string;
    instagram: string;
  };
};

export type SunnyTemplateProps = {
  data: SunnyTemplateData;
};

import { useRef } from 'react';
import { scenes } from './SceneConfig';
import { useScrollEngine } from './useScrollEngine';
import styles from './SunnyTemplate.module.css';

export const SunnyTemplate = ({ data }: SunnyTemplateProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  useScrollEngine({ scrollContainerRef, stageRef, scenes });

  const SVGChevronDown = () => (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"></polyline>
    </svg>
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.mobileContainer}>
        {/* Fixed Stage for all animated assets */}
        <div className={styles.stage} ref={stageRef}>

          {/* Background Layers */}
          <img
            data-anim-id="bg"
            src={data.assets.bg}
            alt="bg"
            className={styles.animatedElement}
            style={{ minWidth: '500px', left: '50%', marginLeft: '-250px', minHeight: '100%', objectFit: 'cover', bottom: 0 }}
          />

          <img
            data-anim-id="flower3"
            src={data.assets.flower3}
            alt="flower3"
            className={styles.animatedElement}
            style={{ minWidth: '500px', left: '50%', marginLeft: '-250px', objectFit: 'cover', bottom: 0 }}
          />

          <img
            data-anim-id="couple"
            src={data.assets.couple}
            alt="couple"
            className={styles.animatedElement}
            style={{ minWidth: '500px', bottom: '50px', left: '50%', marginLeft: '-250px' }}
          />

          <img
            data-anim-id="flower2"
            src={data.assets.flower2}
            alt="flower2"
            className={styles.animatedElement}
            style={{ minWidth: '500px', left: '50%', marginLeft: '-250px', objectFit: 'cover', bottom: 0 }}
          />

          <img
            data-anim-id="flower1"
            src={data.assets.flower1}
            alt="flower1"
            className={styles.animatedElement}
            style={{ minWidth: '500px', left: '50%', marginLeft: '-250px', objectFit: 'cover', bottom: 0 }}
          />

          <div
            data-anim-id="verse"
            className={`${styles.animatedElement} ${styles.quotesContainer}`}
            style={{ opacity: 0 }}
          >
            <p className={styles.p2}>
              "{data.verse.text}"
            </p>
            <p className={styles.p1} style={{ fontWeight: 700, marginTop: '12px' }}>
              {data.verse.source}
            </p>
          </div>

          <div
            data-anim-id="bride"
            className={`${styles.animatedElement} ${styles.coupleContainer}`}
            style={{ bottom: '10px', color: '#000', opacity: 0 }}
          >
            <h2 className={styles.h1} style={{ fontSize: '100px', marginBottom: '4px' }}>{data.bride.nickname}</h2>
            <p className={styles.p1} style={{ fontWeight: 700, marginTop: '4px' }}>{data.bride.fullName}</p>
            <p className={styles.p2} style={{ marginTop: '4px' }}>Daughter of</p>
            <p className={styles.p2} style={{ whiteSpace: 'pre-line' }}>{data.bride.parents}</p>
            <a href={data.bride.instagramLink} target="_blank" rel="noopener noreferrer" className={styles.igContainer}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '4px' }}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              <p className={styles.p2} style={{ marginTop: '2px' }}>{data.bride.instagram}</p>
            </a>
          </div>

          <div
            data-anim-id="groom"
            className={`${styles.animatedElement} ${styles.coupleContainer}`}
            style={{ bottom: '10px', color: '#000', opacity: 0 }}
          >
            <h2 className={styles.h1} style={{ fontSize: '100px', marginBottom: '4px' }}>{data.groom.nickname}</h2>
            <p className={styles.p1} style={{ fontWeight: 700 }}>{data.groom.fullName}</p>
            <p className={styles.p2} style={{ marginTop: '4px' }}>Son of</p>
            <p className={styles.p2} style={{ whiteSpace: 'pre-line' }}>{data.groom.parents}</p>
            <a href={data.groom.instagramLink} target="_blank" rel="noopener noreferrer" className={styles.igContainer}>
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginBottom: '4px' }}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
              <p className={styles.p2} style={{ marginTop: '2px' }}>{data.groom.instagram}</p>
            </a>
          </div>

          <div
            data-anim-id="events"
            className={`${styles.animatedElement} ${styles.textContainer2}`}
            style={{ opacity: 0, gap: '24px' }}
          >
            <div style={{ textAlign: 'left', paddingRight: '10%' }}>
              <p className={styles.h1} style={{ color: '#735d53' }}>{data.events.matrimony.title}</p>
              <p className={styles.p3} style={{ marginTop: '4px', fontWeight: 700 }}>{data.events.matrimony.date}</p>
              <p className={styles.p3}>{data.events.matrimony.time}</p>
              <p className={styles.p3} style={{ marginTop: '4px', fontWeight: 700 }}>{data.events.matrimony.locationName}</p>
              <p className={styles.p3}>{data.events.matrimony.locationAddress}</p>
              <a href={data.events.matrimony.mapLink} target="_blank" rel="noopener noreferrer" className={`${styles.button1} ${styles.p3}`} style={{ pointerEvents: 'auto' }}>Google Maps</a>
            </div>

            <div style={{ textAlign: 'right', paddingLeft: '10%' }}>
              <p className={styles.h1} style={{ color: '#735d53' }}>{data.events.reception.title}</p>
              <p className={styles.p3} style={{ marginTop: '4px', fontWeight: 700 }}>{data.events.reception.date}</p>
              <p className={styles.p3}>{data.events.reception.time}</p>
              <p className={styles.p3} style={{ marginTop: '4px', fontWeight: 700 }}>{data.events.reception.locationName}</p>
              <p className={styles.p3}>{data.events.reception.locationAddress}</p>
              <a href={data.events.reception.mapLink} target="_blank" rel="noopener noreferrer" className={`${styles.button1} ${styles.p3}`} style={{ pointerEvents: 'auto' }}>Google Maps</a>
            </div>

            <div style={{ textAlign: 'center' }}>
              <p className={styles.p3} style={{ lineHeight: 1.5, marginBottom: '8px' }}>
                For guests who are unable to attend, you can watch the event through the link below.
              </p>
              <a href="#" className={`${styles.button1} ${styles.p3}`} style={{ pointerEvents: 'auto' }}>Live Streaming</a>
            </div>
          </div>

          <div
            data-anim-id="dresscode"
            className={`${styles.animatedElement} ${styles.textContainer2}`}
            style={{ opacity: 0, alignItems: 'center' }}
          >
            <h2 className={styles.h1}>{data.dresscode.title}</h2>
            <p className={styles.p2} style={{ textAlign: 'center', maxWidth: '300px', marginTop: '12px' }}>{data.dresscode.description}</p>
            <div className={styles.dcContainer}>
              {data.dresscode.colors.map((color, i) => (
                <div key={i} className={styles.dcItem} style={{ background: color }}></div>
              ))}
            </div>
          </div>

          <div
            data-anim-id="quotes"
            className={`${styles.animatedElement} ${styles.quotesContainer}`}
            style={{ opacity: 0 }}
          >
            <p className={styles.p2}>
              {data.quote.text}
            </p>
          </div>

          {/* Gradients */}
          <div
            data-anim-id="bottomGradient"
            className={styles.animatedElement}
            style={{
              width: '100%',
              height: '50%',
              bottom: 0,
              top: 'auto',
              background: 'linear-gradient(0deg, rgba(230, 240, 235, 1) 0%, rgba(240, 245, 235, 0.6) 60%, rgba(255, 255, 255, 0) 90%)',
              opacity: 0,
              zIndex: 5,
            }}
          />

          {/* Cover Layer */}
          <img
            data-anim-id="coverImage"
            src={data.assets.coverImage}
            alt="Cover"
            className={styles.animatedElement}
            style={{ minWidth: '500px', left: '50%', marginLeft: '-250px', minHeight: '100%', objectFit: 'cover', bottom: 0 }}
          />

          <div
            data-anim-id="coverOverlay"
            className={styles.animatedElement}
            style={{
              width: '100%',
              height: '450px',
              bottom: 0,
              top: 'auto',
              background: 'linear-gradient(180deg, rgba(240, 245, 235, 0) 0%, rgba(235, 245, 240, 0.7) 40%, rgba(235, 240, 235, 0.95) 80%)',
              zIndex: 21,
            }}
          />

          <div
            data-anim-id="coverText"
            className={styles.animatedElement}
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'flex-end',
              alignItems: 'center',
              textAlign: 'center',
              height: '100vh',
              width: '100%',
              paddingBottom: '40px',
              zIndex: 22,
            }}
          >
            <p className={styles.p1} style={{ fontSize: '14px', letterSpacing: '0.5px' }}>{data.cover.subtitle}</p>
            <h1 className={styles.h1} style={{ fontSize: '90px', marginTop: '-10px', marginBottom: '10px' }}>
              {data.cover.title}
            </h1>
            <p className={styles.p1} style={{ fontSize: '15px', fontWeight: 600 }}>{data.cover.date}</p>

            <div style={{ marginTop: '50px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', opacity: 0.8 }}>
              <p className={styles.p2} style={{ fontSize: '14px', fontWeight: 500 }}>Dear,</p>
              <h3 className={styles.p1} style={{ fontSize: '18px', fontWeight: 700 }}>Guest</h3>
              <div style={{ animation: 'bounce 2s infinite', color: '#555', marginTop: '16px' }}>
                <SVGChevronDown />
                <div style={{ marginTop: '-10px' }}><SVGChevronDown /></div>
              </div>
            </div>
          </div>
        </div>

        {/* --- SCROLL DRIVER AND STATIC CONTENT --- */}
        <div className={styles.scrollContainer} ref={scrollContainerRef}>
          <div className={styles.scrollContent}>
            {/* 12 Scenes Drive the Motion Above */}
            {scenes.map((_, i) => (
              <div key={i} className={styles.scrollSection} />
            ))}

            {/* After the scenes complete, the static content scrolls in ON TOP of the stage */}
            <div className={styles.staticContentWrapper}>

              {/* 1. RSVP Section */}
              <section className={styles.staticSection} style={{ overflow: 'visible' }}>
                <div className={styles.countdownRow}>
                  {Object.entries(data.rsvp.countdown).map(([key, val]) => (
                    <div key={key} className={styles.countdownItem}>
                      <span className={styles.countdownValue}>{String(val).padStart(2, '0')}</span>
                      <span className={styles.countdownLabel}>{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                    </div>
                  ))}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <button className={styles.button1} style={{ borderRadius: '24px', padding: '10px 24px', marginBottom: '30px', letterSpacing: '2px', fontSize: '12px', fontWeight: 700 }}>
                    SAVE THE DATE
                  </button>
                </div>

                {/* Tall Flower Bouquet - right side */}
                <div style={{ position: 'relative', height: '250px', marginBottom: '-10px' }}>
                  {data.assets.flowerDecor && (
                    <img src={data.assets.flowerDecor} alt="" style={{ position: 'absolute', right: '-60px', bottom: '0', width: '280px', zIndex: 1 }} />
                  )}
                  {/* Mini couple photo - center */}
                  <img src={data.closing.couplePhoto} alt="" style={{ position: 'absolute', left: '38%', top: '45%', transform: 'translate(-50%,-50%)', width: '130px', height: '130px', objectFit: 'cover', borderRadius: '50%', border: '3px solid #fff', boxShadow: '0 4px 20px rgba(0,0,0,0.12)' }} />
                </div>

                <div className={styles.staticContent}>
                  <h2 className={styles.h1} style={{ fontSize: '70px', textAlign: 'left', lineHeight: 0.8 }}>
                    Rsvp <br /> <span style={{ fontSize: '40px' }}>&</span> Wishes
                  </h2>
                  <p className={styles.p2} style={{ marginTop: '16px', fontSize: '14px', lineHeight: 1.5, fontStyle: 'italic' }}>
                    {data.rsvp.subtitle}
                  </p>

                  <form className={styles.rsvpForm}>
                    <input type="text" placeholder="Name" className={styles.inputField} />
                    <textarea placeholder="Leave a Message" className={styles.textareaField} />
                    <select className={styles.selectField}>
                      <option>Confirm Attendance</option>
                      <option>Yes, I will attend</option>
                      <option>Sorry, I can't attend</option>
                    </select>
                    <button type="button" className={styles.submitBtn}>SUBMIT</button>
                  </form>

                  <div className={styles.commentList}>
                    {data.rsvp.comments.map((comment, i) => (
                      <div key={i} className={styles.commentItem}>
                        <p className={styles.commentName}>{comment.name}</p>
                        <p className={styles.commentText}>{comment.text}</p>
                        <p className={styles.commentTime}>{comment.time}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* 2. Our Love Story */}
              <section className={styles.staticSection}>
                {/* Flower Crown Decoration */}
                {data.assets.flowerDecor2 && (
                  <div style={{ textAlign: 'center', marginBottom: '-30px', position: 'relative', zIndex: 2 }}>
                    <img src={data.assets.flowerDecor2} alt="" style={{ width: '75%', maxWidth: '320px' }} />
                  </div>
                )}
                <h2 className={styles.h1} style={{ textAlign: 'center', position: 'relative', zIndex: 2, marginBottom: '16px' }}>{data.story.title}</h2>

                <div className={styles.storyArch}>
                  <div className={styles.storyImageBg} style={{ backgroundImage: `url(${data.story.bgImage})` }} />
                  <div className={styles.storyOverlay} />
                  <div className={styles.storyContent}>
                    {data.story.timeline.map((item, i) => (
                      <div key={i} className={styles.storyBlock}>
                        <h3 className={styles.h1} style={{ fontSize: '32px', color: '#fff', textShadow: '1px 2px 6px rgba(0,0,0,0.6)' }}>{item.title}</h3>
                        <p className={styles.storyP}>{item.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* 3. Wedding Gift */}
              <section className={styles.staticSection} style={{ position: 'relative', overflow: 'visible' }}>
                {/* Flower bouquet top-left */}
                {data.assets.flowerDecor2 && (
                  <img src={data.assets.flowerDecor2} alt="" style={{ position: 'absolute', left: '-10px', top: '-20px', width: '110px', transform: 'scaleX(-1)', zIndex: 0 }} />
                )}
                <div style={{ paddingLeft: '100px', position: 'relative', zIndex: 1 }}>
                  <h2 className={styles.h1} style={{ fontSize: '50px', lineHeight: 1 }}>{data.gift.title}</h2>
                  <p className={styles.p2} style={{ marginTop: '8px', fontSize: '14px', lineHeight: 1.5, fontStyle: 'italic' }}>
                    {data.gift.description}
                  </p>
                  <button className={styles.button1} style={{ marginTop: '12px', borderRadius: '24px', padding: '8px 20px', letterSpacing: '2px', fontSize: '11px', fontWeight: 700 }}>
                    SEND GIFT
                  </button>
                </div>
              </section>

              {/* 4. Closing Photo + Message */}
              <section className={styles.staticSection} style={{ textAlign: 'center' }}>
                <div className={styles.closingFrame}>
                  <img src={data.closing.couplePhoto} alt="Couple" className={styles.closingPhoto} />
                </div>
                <h2 className={styles.h1} style={{ fontSize: '50px', marginTop: '-20px', position: 'relative', zIndex: 2 }}>
                  {data.closing.coupleName}
                </h2>
                <p className={styles.p2} style={{ marginTop: '16px', fontSize: '13px', lineHeight: 1.6, fontStyle: 'italic', padding: '0 10%' }}>
                  {data.closing.message}
                </p>
              </section>

              {/* 5. Footer */}
              <footer className={styles.footerSection}>
                <p className={styles.p2} style={{ fontSize: '11px', marginBottom: '12px' }}>Invitation by <span style={{ fontWeight: 600 }}>{data.footer.brand}</span></p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <span className={styles.p2} style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"></path></svg>
                    {data.footer.phone}
                  </span>
                  <span className={styles.p2} style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"></path></svg>
                    {data.footer.website}
                  </span>
                  <span className={styles.p2} style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                    {data.footer.instagram}
                  </span>
                </div>
                <p className={styles.p2} style={{ fontSize: '10px', marginTop: '12px', color: '#999' }}>© 2026 {data.footer.brand}. All rights reserved.</p>
              </footer>

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
