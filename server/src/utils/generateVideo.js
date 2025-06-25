const spawn = require("child_process").spawn;
const fs = require("fs");
const path = require("path");

function executeFfmpegCommand(args, processName) {
  return new Promise((resolve, reject) => {
    console.log(`Executing FFmpeg ${processName}: ffmpeg ${args.join(" ")}`);
    const ffmpegProcess = spawn("ffmpeg", args);

    ffmpegProcess.stdout.on("data", (data) => {
      // console.log(`${processName} stdout: ${data}`); // Uncomment for detailed FFmpeg output
    });

    ffmpegProcess.stderr.on("data", (data) => {
      console.error(`${processName} stderr: ${data}`); // FFmpeg typically outputs progress/errors to stderr
    });

    ffmpegProcess.on("close", (code) => {
      if (code === 0) {
        console.log(`${processName} completed successfully.`);
        resolve();
      } else {
        const errorMessage = `${processName} process exited with code ${code}`;
        console.error(errorMessage);
        reject(new Error(errorMessage));
      }
    });

    ffmpegProcess.on("error", (err) => {
      console.error(`Failed to start ${processName} process: ${err.message}`);
      reject(err);
    });
  });
}

async function mergeVideos(videoPaths, outputMergedVideoPath) {
  if (!videoPaths || videoPaths.length === 0) {
    throw new Error("No video paths provided for merging.");
  }
  if (videoPaths.length === 1) {
    console.log(
      "Only one video provided, skipping merge and copying it directly."
    );
    // If only one video, copy it to the merged path as a temporary step
    fs.copyFileSync(videoPaths[0], outputMergedVideoPath);
    return outputMergedVideoPath;
  }

  const listFilePath = path.join(
    path.dirname(outputMergedVideoPath),
    `concat_list_${Date.now()}.txt`
  );
  let fileListContent = "";

  videoPaths.forEach((videoPath) => {
    // Ensure video path is properly escaped for the list file
    const escapedPath = videoPath.replace(/'/g, "'\\''"); // Escape single quotes
    fileListContent += `file '${escapedPath}'\n`;
  });

  fs.writeFileSync(listFilePath, fileListContent);
  console.log(`Concat list created at: ${listFilePath}`);

  const args = [
    "-f",
    "concat",
    "-safe",
    "0", // Allow unsafe file paths (e.g., absolute paths)
    "-i",
    listFilePath,
    "-c",
    "copy", // Copy streams without re-encoding (very fast)
    outputMergedVideoPath,
  ];

  try {
    await executeFfmpegCommand(args, "Video Merging");
    console.log("Videos merged successfully!");
    return outputMergedVideoPath;
  } finally {
    if (fs.existsSync(listFilePath)) {
      fs.unlinkSync(listFilePath); // Clean up the list file
      console.log(`Removed temporary concat list: ${listFilePath}`);
    }
  }
}

module.exports = {
    mergeVideos,
};
