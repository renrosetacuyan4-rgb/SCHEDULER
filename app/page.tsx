import Link from "next/link";
export default function Home() {
  return (
    <main>
      <h1>
  Stop Babysitting Your Content.
  <br />
  <span className="hero-highlight">
    It Can Handle Itself.
  </span>
</h1>

      <p>
        Batch today's content, schedule tomorrow's posts, and let your social
        media show up without dragging you back to the posting calendar every
        morning.
      </p>

      <img
        src="/main image.png"
        alt="The content scheduler"
      />

      <Link href="/scheduler" className="primary-button">
  Put Your Content on Autopilot →
</Link>

<section className="how-it-works">
  

  <h2>HOW IT WORKS</h2>

  <div className="steps">

    <div className="step">
      <span className="step-number">01</span>

      <h3>BATCH IT</h3>

      <p>
        Got a camera roll full of content you’ve been meaning to post?
      </p>

      <p>
        Good — put it all in one place and knock it out in one go.
      </p>

      <p>
        Less scrambling, more batching.
      </p>
    </div>


    <div className="step">
      <span className="step-number">02</span>

      <h3>SCHEDULE IT</h3>

      <p>
        Pick your platforms, choose your dates, line it all up.
      </p>

      <p>
        Your content gets a calendar, you get your time back.
      </p>

      <p>
        Hit schedule and let it roll.
      </p>

      <p>
        Your content keeps showing up while you get back to the work that actually needs you.
      </p>
    </div>


    <div className="step">
      <span className="step-number">03</span>

      <h3>FORGET IT</h3>

      <p>
        Hit schedule and let it roll.
      </p>

      <p>
        Your content keeps showing up while you get back to the work that actually needs you.
      </p>
    </div>

  </div>

  <h3 className="section-ending">
    Create once,stay visible all month
  </h3>
</section>

<section className="why-batch">
  <p className="why-batch-label">WHY BATCH?</p>

  <h2>BECAUSE POSTING EVERY DAY IS A LITTLE RIDICULOUS</h2>

  <p className="why-batch-question">
    You already made the content, so why keep making the same decision
    every morning?
  </p>

  <p className="why-batch-description">
    Batch while you're in the zone, schedule while you've got the
    momentum, then get back to building your business.
  </p>
</section>

{/* BENEFIT 1 */}
<section className="benefit-section">
  <h2>
    Your Audience Shouldn’t Have to Wonder If You’re Still Alive
  </h2>
  <img
    src="/image 1.png"
    alt="Scheduled content appearing consistently throughout the week"
  />

  <p>
    Monday, posted.
    <br />
    Wednesday, posted.
    <br />
    Friday, already handled.
  </p>

  <p>
    Stay visible without staying glued to your posting calendar.
  </p>
</section>


{/* BENEFIT 2 */}
<section className="benefit-section">
  <h2>
    Your Camera Roll Called, It Wants a Job
  </h2>

  <img
    src="/image 2.png"
    alt="Content being organized and scheduled from a camera roll"
  />

  <p>
    Those 38 videos you’ve been meaning to post aren’t memories
    collecting dust.
  </p>

  <p>
    They’re content waiting to work.
    Give them a date, give them a destination, and get them out of
    your camera roll and into the world.
  </p>
</section>


{/* BENEFIT 3 */}
<section className="benefit-section">
  <h2>
    Stop Carrying Your Content Calendar Around in Your Head
  </h2>

  <img
    src="/image 3.png"
    alt="An organized content calendar showing scheduled posts"
  />

  <p>
    You’ve got enough tabs open.
  </p>

  <p>
    Let your scheduler remember what goes where and when, so you can
    spend your brainpower on something that actually moves the
    business forward.
  </p>

  <p>
    Less remembering, more creating.
  </p>
</section>


{/* BENEFIT 4 */}
<section className="benefit-section">
  <h2>
    Tomorrow You Has Enough Problems, Give Them One Less
  </h2>

  <img
    src="/image 4.png"
    alt="A creator enjoying freedom while their content is already scheduled"
  />

  <p>
    Batch today, schedule ahead, and let tomorrow arrive with one less
    thing waiting on your plate.
  </p>

  <p>
    Your content is handled, your calendar is covered, and you’re free
    to focus on what comes next.
  </p>

  <p>
    Future you will thank you.
  </p>
</section>


{/* FINAL CTA */}
<section className="final-cta">

  <h2>
    Your Content Should Work Overtime.
    <br />
    You Shouldn't Have To.
  </h2>

  <p>
    Batch your content once, schedule it ahead, and keep your social
    presence moving without babysitting your posting calendar every
    single day.
  </p>

  <Link href="/scheduler" className="primary-button">
  Start Scheduling →
</Link>



</section>



    </main>
  );
}
