const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const textToSpeech = require("@google-cloud/text-to-speech");
const speech = require("@google-cloud/speech");
const cors = require("cors");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/public", express.static(path.join(__dirname, "public")));
app.use(cors(
    {
        origin: '*', // Allow all origins for development, adjust as needed for production
    }
));

// Initialize Google Text-to-Speech client
const client = new textToSpeech.TextToSpeechClient();

// Initialize Google Speech-to-Text client
const speechClient = new speech.SpeechClient();

// Initialize Google GenAI client
const ai = new GoogleGenAI({
    vertexai: process.env.GOOGLE_GENAI_USE_VERTEXAI,
    project: process.env.GOOGLE_GENAI_PROJECT_ID,
    location: process.env.GOOGLE_GENAI_LOCATION,
});

app.post("/generate", async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: prompt,
        });

        res.json({ text: response.text });

    } catch (error) {
        console.error("Error generating text:", error);
        res.status(500).json({ error: "Failed to generate text" });
    }
});

app.post("/imagen", async (req, res) => {
    const { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    try {
        const response = await ai.models.generateImages({
            model: "imagen-4.0-generate-preview-06-06",
            prompt: prompt,
        });

        const base64 = response.generatedImages[0].image.imageBytes;
        if (!base64) {
            return res.status(500).json({ error: "No image generated" });
        }
        // Decode base64 to buffer
        const buffer = Buffer.from(base64, 'base64');
        // Create a timestamp-based filename
        const timestamp = Date.now();
        const filename = `generated_image_${timestamp}.png`;
        // Define the file path
        const filePath = path.join(__dirname, "public", filename);
        // Write the buffer to a file
        fs.writeFileSync(filePath, buffer);
        // Return the file path or URL
        res.json({ imageUrl: `/public/${filename}` });

    } catch (error) {
        console.error("Error generating image:", error);
        res.status(500).json({ error: "Failed to generate image" });
    }
});

app.post("/veo", async (req, res) => {
    const  { prompt } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }
    try {
        let operation = await ai.models.generateVideos({
          model: "veo-2.0-generate-001",
          prompt: prompt,
          config: {
            numberOfVideos: 1,
            aspectRatio: "16:9",
          },
        });

        console.log("Video generation operation started");

        // Check if the operation is done
        while (!operation.done) {
          console.log("Waiting for video generation to complete...");
          await new Promise((resolve) => setTimeout(resolve, 10000)); // Wait for 5 seconds
          operation = await ai.operations.getVideosOperation({
            operation: operation,
          });
        }

        console.log("Generated Video Success");

        const videoBytes =
          operation.response.generatedVideos[0].video.videoBytes;

        if (!videoBytes) {
          return res.status(500).json({ error: "No video generated" });
        }

        // Decode base64
        const buffer = Buffer.from(videoBytes, "base64");
        // Generate filename
        const timestamp = Date.now();
        const filename = `generated_video_${timestamp}.mp4`;
        const filePath = path.join(__dirname, "public", filename);
        // Save to file
        fs.writeFileSync(filePath, buffer);

        // Send video URL
        res.json({ videoUrl: `/public/${filename}` });
    } catch (error) {
        console.error("Error generating video:", error);
        res.status(500).json({ error: "Failed to generate video" });
    }
})

app.post("/tts", async (req, res) => {
    const { text, languageCode = "id-ID" } = req.body;

    if (!text) {
        return res.status(400).json({ error: "Text is required" });
    }

    try {
        const request = {
          input: { text: text },
          voice: {
            languageCode: languageCode,
            name: "id-ID-Chirp3-HD-Sulafat",
            ssmlGender: "FEMALE",
          },
          audioConfig: { audioEncoding: "MP3" },
        };

        const [response] = await client.synthesizeSpeech(request);
        const audioContent = response.audioContent;

        // stream the audio content to the client
        res.set('Content-Type', 'audio/mpeg');

        res.send(audioContent);

        console.log("Audio content written to file");

        // Create a timestamp-based filename and save the audio file
        // const timestamp = Date.now();
        // const filename = `tts_audio_${timestamp}.mp3`;
        // // Define the file path
        // const filePath = path.join(__dirname, "public", filename);
        // // Write the audio content to a file
        // fs.writeFileSync(filePath, audioContent);
        // res.json({ audioUrl: `/public/${filename}` });

        //testing list voices
        // const request = {
        // };

        // const response = await client.listVoices(request);

        // res.json(response);

    } catch (error) {
        console.error("Error generating speech:", error);
        res.status(500).json({ error: "Failed to generate speech" });
    }
})

app.post("/speechtotext", async (req, res) => {

    try{
        const audioFilePath = path.join(
          __dirname,
          "public",
          "tts_audio_1750425735369.mp3"
        );

        const config = {
          encoding: "MP3",
          sampleRateHertz: 44100,
          languageCode: "id-ID",
        };

        const audio = {
          content: fs.readFileSync(audioFilePath).toString('base64'),
        };

        const request = {
          config: config,
          audio: audio,
        };

        const [response] = await speechClient.recognize(request);
        const transcription = response.results
          .map(result => result.alternatives[0].transcript)
            .join("\n");
        
        res.json({ transcription: transcription });
    }
    catch (error) {
        console.error("Error processing audio:", error);
        res.status(500).json({ error: "Failed to process audio" });
    }

    
});



app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

