// routes/videoProcessing.js
const express = require("express");
const path = require("path");
const fs = require("fs");
const {
  mergeVideos,
//   extractAudio,
//   transcribeAudio,
//   createSrtFile,
//   addStyledCaptionsToVideo,
//   cleanUpTempFiles,
} = require("../utils/generateVideo.js"); // Adjust the path as necessary

const router = express.Router();

// Define directories relative to the project root
const publicDir = path.join(__dirname, "../../", "public");
const tempDir = path.join(__dirname, "../../", "temp");
const outputDir = path.join(__dirname, "../../", "outputs");

// New endpoint: Process videos already present in the 'public' folder
// Expects an array of video filenames in the request body
router.post("/process-local-videos", async (req, res) => {
  const { videoFilenames } = req.body; 

  if (
    !videoFilenames ||
    !Array.isArray(videoFilenames) ||
    videoFilenames.length === 0
  ) {
    return res
      .status(400)
      .json({
        error:
          'Please provide an array of video filenames in the request body (e.g., {"videoFilenames": ["video1.mp4", "video2.mp4"]}).',
      });
  }

  // Construct full paths for the input videos
  const inputVeoVideos = videoFilenames.map((filename) =>
    path.join(publicDir, filename)
  );

  // Validate if all input video files exist
  for (const videoPath of inputVeoVideos) {
    if (!fs.existsSync(videoPath)) {
      return res
        .status(404)
        .json({
          error: `Video file not found: ${path.basename(
            videoPath
          )}. Make sure it exists in the 'public' folder.`,
        });
    }
  }

  const uniqueId = Date.now(); // Use a unique ID for this processing job

  const mergedVideoPath = path.join(
    tempDir,
    `merged_veo_video_${uniqueId}.mp4`
  );
//   const extractedAudioPath = path.join(
//     tempDir,
//     `temp_audio_merged_${uniqueId}.flac`
//   );
//   const srtOutputPath = path.join(
//     tempDir,
//     `output_caption_merged_${uniqueId}.srt`
//   );
//   const finalOutputVideoPath = path.join(
//     outputDir,
//     `final_video_with_tiktok_caption_${uniqueId}.mp4`
//   );

  try {
    console.log("Starting video processing workflow for new request...");

    // 0. Gabungkan Beberapa Video Veo
    console.log("0. Merging input Veo videos...");
    await mergeVideos(inputVeoVideos, mergedVideoPath);
    console.log("Videos merged successfully to:", mergedVideoPath);

    // 1. Ekstrak Audio dari video yang sudah digabung
    // console.log("1. Extracting audio from merged video...");
    // await extractAudio(mergedVideoPath, extractedAudioPath);
    // console.log("Audio extracted successfully.");

    // // 2. Transkripsi Audio
    // console.log("2. Transcribing audio to text...");
    // const transcription = await transcribeAudio(extractedAudioPath);
    // console.log("Transcription complete.");

    // // 3. Buat File SRT
    // console.log("3. Creating SRT file...");
    // createSrtFile(transcription, srtOutputPath);
    // console.log("SRT file created successfully.");

    // // 4. Tambahkan Caption Bergaya ke Video yang sudah digabung
    // console.log(
    //   "4. Embedding styled captions into final video (this might take a while)..."
    // );
    // await addStyledCaptionsToVideo(
    //   mergedVideoPath,
    //   srtOutputPath,
    //   finalOutputVideoPath
    // );
    // console.log("All processes finished successfully!");

    // Respond with the path to the final video
    // res.status(200).json({
    //   message: "Video processed successfully!",
    //   finalVideoUrl: `/outputs/${path.basename(finalOutputVideoPath)}`, // Accessible via http://localhost:3000/outputs/final_video_with_tiktok_caption_XXX.mp4
    // });

    res.status(200).json({
        message: "Video processed successfully!",
        mergedVideoUrl: `/temp/${path.basename(mergedVideoPath)}`, // Accessible via http://localhost:3000/temp/merged_veo_video_XXX.mp4
    });
  } catch (error) {
    console.error("An error occurred during the process:", error);
    res.status(500).json({
      error: "An internal server error occurred during video processing.",
      details: error.message,
    });
}
//   } finally {
//     // Membersihkan file sementara
//     // Perhatikan: video input asli di public/ tidak dihapus
//     // const tempFiles = [mergedVideoPath, extractedAudioPath, srtOutputPath];
//     // cleanUpTempFiles(tempFiles);


//   }
});

module.exports = router;
