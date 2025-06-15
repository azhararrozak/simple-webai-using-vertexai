const express = require("express");
const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use("/public", express.static(path.join(__dirname, "public")));

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


app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

