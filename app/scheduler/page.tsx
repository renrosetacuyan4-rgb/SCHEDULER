"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";


type ScheduledVideo = {
  file: File;
  date: string;
  time: string;
  storagePath: string;
};

type SavedScheduledVideo = {
  id: string;
  videoName: string;
  platform: string;
  scheduledDate: string;
  scheduledTime: string;
  status: string;
  storagePath: string | null;
};


export default function Scheduler() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [videos, setVideos] = useState<File[]>([]);
const [uploadedStoragePaths, setUploadedStoragePaths] = useState<string[]>([]);
const [step, setStep] = useState(1);

const [schedule, setSchedule] = useState<ScheduledVideo[]>([]);
const [savedSchedules, setSavedSchedules] = useState<
  SavedScheduledVideo[]
>([]);


  const [startDate, setStartDate] = useState("");
  const [defaultTime, setDefaultTime] = useState("19:00");
  const [scheduleApplied, setScheduleApplied] = useState(false); 
  const [scheduleConfirmed, setScheduleConfirmed] = useState(false);
const schedulingLockRef = useRef(false);
const [isScheduling, setIsScheduling] = useState(false);
useEffect(() => {
  loadScheduledVideos();
}, []);


  function handleUploadClick() {
    fileInputRef.current?.click();
  }

  async function handleFileChange(
  event: React.ChangeEvent<HTMLInputElement>
) {
  const selectedFiles = Array.from(event.target.files || []);

  if (selectedFiles.length === 0) {
    return;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    const { data, error } = await supabase.auth.signInAnonymously();

    if (error || !data.user) {
      console.error(
        "Could not create Supabase user:",
        error?.message
      );
      return;
    }
  }

  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    console.error("No Supabase user found.");
    return;
  }

  const uploadedPaths: string[] = [];

for (const file of selectedFiles) {
  const uniqueFileName = `${crypto.randomUUID()}-${file.name}`;
const filePath = `${currentUser.id}/${uniqueFileName}`;

  const { error } = await supabase.storage
    .from("videos")
    .upload(filePath, file);

  if (error) {
    console.error(
      `Failed to upload ${file.name}:`,
      error.message
    );
    continue;
  }

  uploadedPaths.push(filePath);

  console.log(
    `Uploaded ${file.name} → videos/${filePath}`
  );
}

setUploadedStoragePaths((currentPaths) => [
  ...currentPaths,
  ...uploadedPaths,
]);

setVideos((currentVideos) => [
  ...currentVideos,
  ...selectedFiles,
]);

console.log("Uploaded storage paths:", uploadedPaths);
console.log(
  "All storage paths now:",
  [...uploadedStoragePaths, ...uploadedPaths]
);


  event.target.value = "";
}

  /*
   * CREATE THE INITIAL SMART SCHEDULE
   *
   * Every video gets:
   * - a date
   * - a time
   *
   * The default behavior is one video per day.
   */

 function createInitialSchedule() {
  if (videos.length === 0) return;

  if (uploadedStoragePaths.length !== videos.length) {
    console.error("Upload/schedule mismatch:", {
      videosCount: videos.length,
      storagePathsCount: uploadedStoragePaths.length,
      videos,
      uploadedStoragePaths,
    });

    return;
  }

  const missingStoragePath = uploadedStoragePaths.some(
    (path) => !path
  );

  if (missingStoragePath) {
    console.error(
      "Cannot create schedule because at least one video has no Storage path.",
      uploadedStoragePaths
    );

    return;
  }

  const today = new Date();

const newSchedule = videos.map((video, index) => {
  const date = new Date(today);

  date.setDate(today.getDate() + index);

  const scheduledDate = [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");

  return {
    file: video,
    date: scheduledDate,
    time: defaultTime,
    storagePath: uploadedStoragePaths[index],
  };
});

  console.log("Created schedule with Storage paths:", newSchedule);

  setSchedule(newSchedule);
}

  /*
   * MOVE FROM STEP 2 → STEP 3
   */

  function goToSchedule() {
  const today = new Date();

  const todayString = [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");

  setStartDate(todayString);
  createInitialSchedule();
  setStep(3);
}


  /*
   * CHANGE ONE VIDEO'S DATE
   */

  function updateVideoDate(
    index: number,
    date: string
  ) {
    setSchedule((currentSchedule) =>
      currentSchedule.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              date,
            }
          : item
      )
    );
  }

  /*
   * CHANGE ONE VIDEO'S TIME
   */

  function updateVideoTime(
    index: number,
    time: string
  ) {
    setSchedule((currentSchedule) =>
      currentSchedule.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              time,
            }
          : item
      )
    );
  }

  /*
   * APPLY THE SAME STARTING RULE
   * TO THE WHOLE BATCH
   */

 function applyScheduleToAll() {
  if (!startDate) {
    console.error("Cannot apply schedule: no starting date selected.");
    return;
  }

  if (uploadedStoragePaths.length !== videos.length) {
    console.error("Cannot apply schedule: upload/storage path mismatch.", {
      videosCount: videos.length,
      storagePathsCount: uploadedStoragePaths.length,
    });
    return;
  }

  const newSchedule = videos.map((video, index) => {
    const date = new Date(startDate + "T00:00:00");

    date.setDate(date.getDate() + index);

    const scheduledDate = [
      date.getFullYear(),
      String(date.getMonth() + 1).padStart(2, "0"),
      String(date.getDate()).padStart(2, "0"),
    ].join("-");

    return {
      file: video,
      date: scheduledDate,
      time: defaultTime,
      storagePath: uploadedStoragePaths[index],
    };
  });

  console.log("APPLYING BATCH SCHEDULE:", {
    startDate,
    defaultTime,
    schedule: newSchedule,
  });

  setSchedule(newSchedule);
  setScheduleApplied(true);
}


async function handleConfirmSchedule() {
  // Prevent duplicate submissions.
  if (schedulingLockRef.current) {
    console.log("Schedule submission already in progress.");
    return;
  }

  if (schedule.length === 0) {
    return;
  }

  // Lock immediately before doing any async work.
  schedulingLockRef.current = true;
  setIsScheduling(true);

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("No Supabase user found.");
      return;
    }

    const missingStoragePath = schedule.some(
      (item) => !item.storagePath
    );

    if (missingStoragePath) {
      console.error(
        "Cannot save schedule because one or more videos are missing a Storage path:",
        schedule
      );

      return;
    }

    const rowsToInsert = schedule.map((item) => {
      const localDateTime = `${item.date}T${item.time}:00`;

      const scheduledAt = new Date(localDateTime);

      return {
        video_name: item.file.name,
        platform: "TikTok",
        scheduled_date: item.date,
        scheduled_time: item.time,
        scheduled_at: scheduledAt.toISOString(),
        status: "scheduled",
        storage_path: item.storagePath,
        user_id: user.id,
      };
    });

    console.log(
      "FINAL DATABASE PAYLOAD:",
      rowsToInsert
    );

    const { data: insertedRows, error } = await supabase
      .from("scheduled_videos")
      .insert(rowsToInsert)
      .select("*");

    if (error) {
      console.error(
        "Failed to save schedule:",
        error.message
      );
      return;
    }

    console.log(
      "SUPABASE ACTUALLY INSERTED:",
      insertedRows
    );

    console.log(
      `Successfully scheduled ${schedule.length} video${
        schedule.length === 1 ? "" : "s"
      }.`
    );

    setScheduleConfirmed(true);
  } finally {
    // Always unlock, even if the request fails.
    schedulingLockRef.current = false;
    setIsScheduling(false);
  }
}

async function loadScheduledVideos() {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    console.error("No Supabase user found.");
    return;
  }

  const { data, error } = await supabase
    .from("scheduled_videos")
    .select("*")
    .eq("user_id", user.id);

  if (error) {
    console.error(
      "Failed to load scheduled videos:",
      error.message
    );
    return;
  }

  const loadedSchedules: SavedScheduledVideo[] = data.map(
    (item) => ({
      id: item.id,
      videoName: item.video_name,
      platform: item.platform,
      scheduledDate: item.scheduled_date,
      scheduledTime: item.scheduled_time,
      status: item.status,
      storagePath: item.storage_path,
    })
  );

  setSavedSchedules(loadedSchedules);

  console.log("Saved schedules loaded:", loadedSchedules);
}


  /*
   * MAKE A DATE LOOK BEAUTIFUL
   *
   * Example:
   * 2026-09-01
   * becomes
   * Mon, Sep 1
   */

  function formatDate(dateString: string) {
    if (!dateString) {
      return "Choose date";
    }

    const date = new Date(
      `${dateString}T00:00:00`
    );

    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    });
  }

  /*
   * MAKE A TIME LOOK BEAUTIFUL
   *
   * Example:
   * 19:00
   * becomes
   * 7:00 PM
   */

  function formatTime(timeString: string) {
    if (!timeString) {
      return "Choose time";
    }

    const [hours, minutes] =
      timeString.split(":");

    const date = new Date();

    date.setHours(Number(hours));
    date.setMinutes(Number(minutes));

    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  }

  return (
    <main className="scheduler-page">

      {/* =====================================
          FIRST SCREEN — UPLOAD
          ===================================== */}

      {videos.length === 0 ? (
        <>
          <h1>
            Your Content&apos;s Ready.
            <br />
            Let&apos;s Get It Out There.
          </h1>

          <p className="scheduler-subheadline">
            Your videos are edited, backed up, and sitting pretty in your
            camera roll. So why keep coming back every day just to post them?
            Drop them here, batch them together, and schedule them ahead —
            then go do literally anything else.
          </p>

          <img
            className="scheduler-image"
            src="/Scheduler.png"
            alt="Content scheduler"
          />

          <button
            className="upload-button"
            type="button"
            onClick={handleUploadClick}
          >
            Upload My Content →
          </button>

          <p className="upload-note">
            Less than 2 minutes to upload · Then you&apos;re off the hook
          </p>
        </>
      ) : (
        <>
          {/* =====================================
              STEP 1 — REVIEW CONTENT
              ===================================== */}

          {step === 1 && (
            <>
              <p className="step-label">
                STEP 1 OF 3
              </p>

              <h1>
                Nice. We&apos;ve got
                <br />
                your content.
              </h1>

              <p className="scheduler-subheadline">
                {videos.length}{" "}
                {videos.length === 1
                  ? "video is"
                  : "videos are"}{" "}
                ready to go.
              </p>

              <div className="video-grid">
                {videos
                  .slice(0, 3)
                  .map((video, index) => (
                    <div
                      className="video-card"
                      key={`${video.name}-${index}`}
                    >
                      <video
                        src={URL.createObjectURL(video)}
                        className="video-thumbnail"
                        autoPlay
                        muted
                        loop
                        playsInline
                      />

                      <p className="video-name">
                        {video.name}
                      </p>
                    </div>
                  ))}

                {videos.length > 3 && (
                  <div className="video-more">
                    +{videos.length - 3} more
                  </div>
                )}
              </div>

              <div className="scheduler-actions">
                <button
                  className="add-more-button"
                  type="button"
                  onClick={handleUploadClick}
                >
                  + Add more
                </button>

                <button
                  className="continue-button"
                  type="button"
                  onClick={() => setStep(2)}
                >
                  Continue →
                </button>
              </div>
            </>
          )}

          {/* =====================================
              STEP 2 — DESTINATION
              ===================================== */}

          {step === 2 && (
            <>
              <p className="step-label">
                STEP 2 OF 3
              </p>

              <h1>
                Where should we
                <br />
                send it?
              </h1>

              <p className="scheduler-subheadline">
                Choose where you want your content to go.
              </p>

              <div className="platform-card selected">
                <div>
                  <strong>
                    TikTok
                  </strong>

                  <span>
                    Ready to schedule
                  </span>
                </div>

                <div className="platform-check">
                  ✓
                </div>
              </div>

              <button
                className="continue-button"
                type="button"
                onClick={goToSchedule}
              >
                Continue →
              </button>
            </>
          )}
 {/* =====================================
              STEP 3 OF 3 — SCHEDULE
              ===================================== */}

           {step === 3 && (
            <section className="schedule-builder">
              <div className="schedule-header">
                <p className="schedule-eyebrow">STEP 3 OF 3</p>

                <h1>When do you want these to go out?</h1>

                <p className="schedule-subheadline">
                  Pick when you want to post. We&apos;ll take care of the rest.
                </p>
              </div>

              <div className="schedule-list">
                {schedule.map((item, index) => (
                  <div
                    className="schedule-row"
                    key={`${item.file.name}-${index}`}
                  >
                    <div className="schedule-thumbnail">
                      <video
                        src={URL.createObjectURL(item.file)}
                        muted
                        playsInline
                        preload="metadata"
                      />

                      <span>{index + 1}</span>
                    </div>

                    <div className="schedule-video-info">
                      <span className="schedule-video-number">
                        VIDEO {String(index + 1).padStart(2, "0")}
                      </span>

                      <strong title={item.file.name}>
                        {item.file.name}
                      </strong>
                    </div>



                    <label className="schedule-control">
  <span>DATE</span>

  <div className="schedule-input-wrap schedule-date-wrap">
    <span className="schedule-date-display">
      {formatDate(item.date)}
    </span>

   <span className="schedule-calendar-icon">◴</span>
    <input
      className="schedule-input schedule-date-input"
      type="date"
      value={item.date}
      onChange={(event) =>
        updateVideoDate(index, event.target.value)
      }
      
    />
  </div>
</label>

                    <label className="schedule-control">
  <span>TIME</span>

  <div className="schedule-input-wrap schedule-time-wrap">
    <span className="schedule-time-display">
      {formatTime(item.time)}
    </span>

    <span className="schedule-clock-icon">◷</span>

    <input
      className="schedule-input schedule-time-input"
      type="time"
      value={item.time}
      onChange={(event) =>
        updateVideoTime(index, event.target.value)
      }
    />
  </div>
</label>

                  </div>
                ))}
              </div>

              <section className="batch-scheduler">
                <div className="batch-top">
                  <div className="batch-symbol">↗</div>

                  <div>
                    <p className="schedule-eyebrow">
                      SET IT &amp; FORGET IT
                    </p>

                    <h2>Schedule the whole batch</h2>

                    <p>
                      Choose your starting date and time. We&apos;ll space the
                      rest out one day at a time.
                    </p>
                  </div>
                </div>

                <div className="batch-controls">
                 
                 <label className="schedule-control">
  <span>STARTING DATE</span>

  <div className="schedule-input-wrap schedule-date-wrap">
    <span className="schedule-date-display">
      {formatDate(startDate)}
    </span>

    <span className="schedule-calendar-icon">◫</span>

    <input
      className="schedule-input schedule-date-input"
      type="date"
      value={startDate}
      onChange={(event) => {
        setStartDate(event.target.value);
        setScheduleApplied(false);
      }}
    />
  </div>
</label>

                  <label className="schedule-control">
  <span>STARTING TIME</span>

  <div className="schedule-input-wrap schedule-time-wrap">
    <span className="schedule-time-display">
      {formatTime(defaultTime)}
    </span>

    <span className="schedule-clock-icon">◷</span>

    <input
      className="schedule-input schedule-time-input"
      type="time"
      value={defaultTime}
      onChange={(event) => {
        setDefaultTime(event.target.value);
        setScheduleApplied(false);
      }}
    />
  </div>
</label>


                  <button
                    className={`batch-apply ${
                      scheduleApplied ? "applied" : ""
                    }`}
                    type="button"
                    onClick={applyScheduleToAll}

                    disabled={!startDate}
                  >
                    {scheduleApplied
                      ? "✓ Applied to all"
                      : "Apply to all"}
                  </button>
                </div>

                {scheduleApplied && startDate && (
                  <p className="batch-confirmation">
                    {videos.length}{" "}
                    {videos.length === 1 ? "post" : "posts"} updated starting{" "}
                    {formatDate(startDate)} at {formatTime(defaultTime)}.
                  </p>
                )}
              </section>

              <div className="schedule-footer">
                <p className="schedule-safe">
                  ✓ Review your schedule before anything goes live.
                </p>

                <button
  className="schedule-final-button"
  type="button"
  onClick={() => setStep(4)}
>
  Schedule {videos.length}{" "}
  {videos.length === 1 ? "video" : "videos"} →
</button>

              </div>
            </section>
          )}

{step === 4 && (
  !scheduleConfirmed ? (
    <section className="schedule-review">

      {/* HEADER */}
      <div className="schedule-review-header">
        <p className="schedule-eyebrow">STEP 4 OF 4</p>

        <h1>Review your schedule</h1>

        <p className="schedule-review-subheadline">
          One last look before we put your content on autopilot.
        </p>
      </div>

      {/* SIMPLE SUMMARY */}
      <div className="schedule-review-summary">
        <strong>
          Your {videos.length}{" "}
          {videos.length === 1 ? "video is" : "videos are"} scheduled for TikTok.
        </strong>
      </div>

      {/* PUBLISHING BOARD */}
      <div className="schedule-review-board">

        {/* TABLE HEADER */}
        <div className="schedule-review-board-header">
          <span>CONTENT</span>
          <span>SCHEDULE</span>
          <span>STATUS</span>
        </div>

        {/* SCROLLABLE VIDEO LIST */}
        <div className="schedule-review-list">

          {schedule.map((item, index) => (
            <article
              className="schedule-review-row"
              key={`${item.file.name}-${index}`}
            >

              {/* CONTENT */}
              <div className="schedule-review-content">

                <div className="schedule-review-preview">

                  <video
                    src={URL.createObjectURL(item.file)}
                    controls
                    playsInline
                    preload="metadata"
                    aria-label={`Preview video ${index + 1}`}
                  />

                  <span className="schedule-review-index">
                    {String(index + 1).padStart(2, "0")}
                  </span>

                </div>

                <div className="schedule-review-file">

                  <span className="schedule-review-label">
                    VIDEO {String(index + 1).padStart(2, "0")}
                  </span>

                  <p title={item.file.name}>
                    {item.file.name}
                  </p>

                </div>

              </div>

              {/* SCHEDULE */}
              <div className="schedule-review-when">

                <strong>
                  {formatDate(item.date)}
                </strong>

                <span>
                  {formatTime(item.time)}
                </span>

              </div>

              {/* STATUS */}
              <div className="schedule-review-status">

                <span className="schedule-status-check">
                  ✓
                </span>

                <small>
                  READY
                </small>

              </div>

            </article>
          ))}

        </div>
      </div>

      {/* CONFIRMATION */}
      <div className="schedule-review-confirmation">

        <strong>
          Everything looks right?
        </strong>

        <span>
          You can still go back and make changes before you confirm.
        </span>

      </div>

      {/* ACTIONS */}
      <div className="schedule-review-footer">

        <button
          className="schedule-review-back"
          type="button"
          onClick={() => setStep(3)}
        >
          <span>←</span>
          Back to schedule
        </button>

        <button
          className="schedule-review-confirm"
          type="button"
          onClick={handleConfirmSchedule}
          disabled={isScheduling}
        >
          {isScheduling
            ? "Scheduling..."
            : (
              <>
                Confirm &amp; schedule {videos.length}{" "}
                {videos.length === 1 ? "video" : "videos"}
                <span>→</span>
              </>
            )}
        </button>

      </div>

    </section>
  ) : (
    <section className="schedule-success">

      <p className="schedule-eyebrow">
        ALL SET
      </p>

      <h1>
        You&apos;re officially
        <br />
        off the hook.
      </h1>

      <p className="schedule-success-text">
        Your {videos.length}{" "}
        {videos.length === 1 ? "video is" : "videos are"} scheduled and ready to go.
      </p>

      <button
        className="schedule-success-button"
        type="button"
        onClick={() => {
          setScheduleConfirmed(false);
          setStep(3);
        }}
      >
        Back to schedule →
      </button>

    </section>
  )
)}

        </>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept="video/*"
        multiple
        onChange={handleFileChange}
        style={{ display: "none" }}
      />
    </main>
  );
}