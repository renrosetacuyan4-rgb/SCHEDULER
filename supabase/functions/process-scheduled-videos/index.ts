import { createClient } from "@supabase/supabase-js";

Deno.serve(async () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseServiceRoleKey = Deno.env.get(
    "SUPABASE_SERVICE_ROLE_KEY"
  );

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    return new Response(
      JSON.stringify({
        success: false,
        error: "Missing Supabase environment variables.",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  const supabase = createClient(
    supabaseUrl,
    supabaseServiceRoleKey
  );

  console.log("Scheduled video worker started.");

  const now = new Date();

console.log(
  `Checking for videos due at ${now.toISOString()}.`
);


  // Find videos that are due.
const { data: videos, error } = await supabase
  .from("scheduled_videos")
  .select("*")
  .eq("status", "scheduled")
  .lte("scheduled_at", now.toISOString());


  if (error) {
    console.error(
      "Failed to find scheduled videos:",
      error.message
    );

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }

  console.log(
    `Found ${videos.length} video${
      videos.length === 1 ? "" : "s"
    } ready to process.`
  );

  // Process each due video.
  for (const video of videos) {
    // Claim the video.
    const { data: claimedVideo, error: claimError } =
      await supabase
        .from("scheduled_videos")
        .update({ status: "publishing" })
        .eq("id", video.id)
        .eq("status", "scheduled")
        .select("id")
        .maybeSingle();

    if (claimError) {
      console.error(
        `Failed to claim video ${video.id}:`,
        claimError.message
      );

      continue;
    }

    if (!claimedVideo) {
      console.log(
        `Skipped video ${video.id}; it was already claimed.`
      );

      continue;
    }

    console.log(`Claimed video ${video.id}.`);

    // Get the Storage path of the uploaded video.
    const storagePath =
      video.storage_path ?? video.video_url;

    if (!storagePath) {
      console.error(
        `Video ${video.id} has no storage path.`
      );

      const { error: failedError } = await supabase
        .from("scheduled_videos")
        .update({ status: "failed" })
        .eq("id", video.id)
        .eq("status", "publishing");

      if (failedError) {
        console.error(
          `Failed to mark video ${video.id} as failed:`,
          failedError.message
        );
      }

      continue;
    }

    console.log(
      `Downloading video ${video.id} from Storage: ${storagePath}`
    );

    // Download the real .mp4 from the private videos bucket.
    const { data: videoFile, error: downloadError } =
      await supabase.storage
        .from("videos")
        .download(storagePath);

    if (downloadError) {
      console.error(
        `Failed to download video ${video.id}:`,
        downloadError.message
      );

      const { error: failedError } = await supabase
        .from("scheduled_videos")
        .update({ status: "failed" })
        .eq("id", video.id)
        .eq("status", "publishing");

      if (failedError) {
        console.error(
          `Failed to mark video ${video.id} as failed:`,
          failedError.message
        );
      }

      continue;
    }

    console.log(
      `Successfully downloaded video ${video.id}.`
    );

    console.log(
      `Video size: ${videoFile.size} bytes.`
    );

    // TEMPORARY SIMULATION:
    // Pretend the video was successfully published.
    const { error: publishError } = await supabase
      .from("scheduled_videos")
      .update({ status: "published" })
      .eq("id", video.id)
      .eq("status", "publishing");

    if (publishError) {
      console.error(
        `Failed to complete publishing for video ${video.id}:`,
        publishError.message
      );

      continue;
    }

    console.log(
      `Simulated publishing completed for video ${video.id}.`
    );
  }

  return new Response(
    JSON.stringify({
      success: true,
      found: videos.length,
      videos,
    }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
});