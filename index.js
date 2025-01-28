// Required dependencies
const express = require('express');
const { createClient } = require('@deepgram/sdk');
const ffmpeg = require('fluent-ffmpeg');
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const gTTS = require('gtts');
const sharp = require('sharp');
const axios = require('axios');
require("dotenv").config();

const app = express();
app.use(express.json());

// Configuration
const VIDEOS_DIR = path.join(__dirname, 'videos');
const TEMP_DIR = path.join(__dirname, 'temp');
const OUTPUT_DIR = path.join(__dirname, 'output');

// Ensure directories exist
[VIDEOS_DIR, TEMP_DIR, OUTPUT_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Function to get duration of media file (works for both video and audio)
async function getMediaDuration(filePath) {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, metadata) => {
            if (err) reject(err);
            else resolve(metadata.format.duration);
        });
    });
}

// Function to create a repeated video if needed
async function ensureVideoDuration(inputVideoPath, requiredDuration) {
    const videoDir = path.dirname(inputVideoPath);
    const videoName = path.basename(inputVideoPath, '.mp4');
    const extendedVideoPath = path.join(TEMP_DIR, `${videoName}_extended.mp4`);
    
    const videoDuration = await getMediaDuration(inputVideoPath);
    
    // If video is already longer than required, return original
    if (videoDuration >= requiredDuration) {
        return inputVideoPath;
    }
    
    // Calculate how many times we need to loop the video
    const repeatCount = Math.ceil(requiredDuration / videoDuration);
    console.log(`Video needs to be repeated ${repeatCount} times to match audio duration`);
    
    // Create a file with video repeated
    return new Promise((resolve, reject) => {
        // Create the concatenation list file
        const listPath = path.join(TEMP_DIR, 'concat_list.txt');
        const fileContent = Array(repeatCount).fill(`file '${inputVideoPath.replace(/'/g, "'\\''")}'`).join('\n');
        
        fs.writeFileSync(listPath, fileContent);
        
        ffmpeg()
            .input(listPath)
            .inputOptions(['-f', 'concat', '-safe', '0'])
            .videoCodec('libx264')
            .outputOptions([
                '-pix_fmt yuv420p',
                '-movflags +faststart'
            ])
            .output(extendedVideoPath)
            .on('progress', (progress) => {
                console.log(`Extending video duration: ${Math.round(progress.percent || 0)}% done`);
            })
            .on('end', () => {
                console.log('Successfully extended video duration');
                // Clean up the list file
                fs.unlinkSync(listPath);
                resolve(extendedVideoPath);
            })
            .on('error', (err) => {
                console.error('Error extending video:', err);
                // Clean up the list file even on error
                if (fs.existsSync(listPath)) {
                    fs.unlinkSync(listPath);
                }
                reject(err);
            })
            .run();
    });
}

// Function to convert text to speech
async function textToSpeech(text, outputPath) {
    return new Promise((resolve, reject) => {
        const gtts = new gTTS(text, 'en');
        gtts.save(outputPath, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

// Function to get transcript with timing
async function getTranscript(audioPath) {
    const deepgram = createClient(process.env.DEEPGRAM_API_KEY);
    const audioFile = await fsPromises.readFile(audioPath);
    
    const { result, error } = await deepgram.listen.prerecorded.transcribeFile(
        audioFile,
        { model: "nova-2", smart_format: true }
    );
    
    if (error) throw error;
    
    // Process words into groups of three
    const words = result.results.channels[0].alternatives[0].words;
    const groupedTranscript = [];
    
    for (let i = 0; i < words.length; i += 3) {
        const group = words.slice(i, i + 3);
        groupedTranscript.push({
            text: group.map(w => w.punctuated_word).join(' '),
            start: group[0].start,
            end: group[group.length - 1].end
        });
    }
    
    return groupedTranscript;
}

// Function to extract frames from video
async function extractFrames(videoPath, fps = 30) {
    const framesDir = path.join(TEMP_DIR, 'frames');
    await fsPromises.mkdir(framesDir, { recursive: true });
    
    return new Promise((resolve, reject) => {
        ffmpeg(videoPath)
            .fps(fps)
            .on('end', () => resolve(framesDir))
            .on('error', reject)
            .output(path.join(framesDir, 'frame-%04d.png'))
            .run();
    });
}

// Function to add text overlay to image
async function addTextOverlay(imagePath, text, outputPath) {
    // Get image metadata to determine dimensions
    const metadata = await sharp(imagePath).metadata();
    const { width, height } = metadata;

    // Calculate font size based on image dimensions
    const fontSize = Math.max(Math.min(width, height) / 20, 24); // Responsive font size

    const svgText = `
        <svg width="${width}" height="${height}">
            <style>
                .title { 
                    fill: white; 
                    font-size: ${fontSize}px;
                    font-weight: bold;
                    font-family: 'Arial';
                    filter: drop-shadow(3px 3px 3px rgba(0,0,0,0.7));
                }
            </style>
            <text x="50%" y="90%" text-anchor="middle" class="title">${text}</text>
        </svg>
    `;

    try {
        await sharp(imagePath)
            .composite([{
                input: Buffer.from(svgText),
                top: 0,
                left: 0
            }])
            .toFile(outputPath);
        
        console.log(`Successfully processed frame: ${path.basename(imagePath)}`);
    } catch (error) {
        console.error(`Error processing frame ${path.basename(imagePath)}:`, error);
        // Copy original file if overlay fails
        await fsPromises.copyFile(imagePath, outputPath);
    }
}

// Function to extract Reddit post content
async function getRedditPostContent(url) {
    try {
        // Convert URL to JSON API URL
        // Example: https://www.reddit.com/r/subreddit/comments/123abc/title
        // to: https://www.reddit.com/r/subreddit/comments/123abc.json
        const jsonUrl = url.replace(/\/$/, '') + '.json';
        
        const response = await axios.get(jsonUrl, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        });

        // Get the post data from the response
        const postData = response.data[0].data.children[0].data;
        
        // Get the post content (selftext) and title
        const title = postData.title;
        const content = postData.selftext;
        
        // Combine title and content
        const fullContent = `${title}\n\n${content}`;
        
        // Check if content is empty
        if (!content.trim()) {
            throw new Error('Reddit post has no text content');
        }
        
        return fullContent;
    } catch (error) {
        if (error.response) {
            // Handle specific HTTP errors
            switch (error.response.status) {
                case 404:
                    throw new Error('Reddit post not found');
                case 403:
                    throw new Error('Access to Reddit post forbidden');
                case 429:
                    throw new Error('Rate limit exceeded for Reddit API');
                default:
                    throw new Error(`Error fetching Reddit post: ${error.response.status}`);
            }
        }
        throw error;
    }
}

// Function to combine frames back into video
async function combineFrames(framesDir, outputPath, fps = 30) {
    return new Promise((resolve, reject) => {
        ffmpeg()
            .input(path.join(framesDir, 'processed-frame-%04d.png'))
            .inputFPS(fps)
            .videoCodec('libx264')
            .outputOptions([
                '-pix_fmt yuv420p',  // Required for compatibility
                '-movflags +faststart',  // Enable fast start for web playback
                '-r 30'  // Force output framerate
            ])
            .output(outputPath)
            .on('end', resolve)
            .on('error', (err) => {
                console.error('Error in combineFrames:', err);
                reject(err);
            })
            .run();
    });
}

// Main processing endpoint
app.post('/process-video', async (req, res) => {
    try {
        const { videoId, text, isRedditPost } = req.body;
        
        // Get actual text content (from Reddit if necessary)
        let textContent;
        if (isRedditPost) {
            try {
                textContent = await getRedditPostContent(text); // Here 'text' would be the Reddit URL
                console.log('Successfully extracted Reddit content');
            } catch (error) {
                throw new Error(`Failed to get Reddit content: ${error.message}`);
            }
        } else {
            textContent = text;
        }
        console.log(textContent);
        // 1. Generate speech from text
        const audioPath = path.join(TEMP_DIR, 'speech.mp3');
        await textToSpeech(textContent, audioPath);
        
        // 2. Get audio duration and prepare video
        const audioDuration = await getMediaDuration(audioPath);
        console.log(`Audio duration: ${audioDuration} seconds`);
        
        const originalVideoPath = path.join(VIDEOS_DIR, `${videoId}.mp4`);
        const videoPath = await ensureVideoDuration(originalVideoPath, audioDuration);
        console.log(`Prepared video path: ${videoPath}`);
        
        // 3. Get transcript with timing
        const transcript = await getTranscript(audioPath);
        
        // 4. Process video frames
        const framesDir = await extractFrames(videoPath);
        const frameFiles = await fsPromises.readdir(framesDir);
        console.log(`Found ${frameFiles.length} frames to process`);

        // Sort frames numerically
        frameFiles.sort((a, b) => {
            const numA = parseInt(a.match(/\d+/)[0]);
            const numB = parseInt(b.match(/\d+/)[0]);
            return numA - numB;
        });

        for (const frame of frameFiles) {
            const frameNumber = parseInt(frame.match(/\d+/)[0]);
            const frameTime = frameNumber / 30; // Assuming 30fps
            const textGroup = transcript.find(g => 
                frameTime >= g.start && frameTime <= g.end
            );
            
            const inputPath = path.join(framesDir, frame);
            const outputPath = path.join(framesDir, `processed-${frame}`);
            
            if (textGroup) {
                await addTextOverlay(
                    inputPath,
                    textGroup.text,
                    outputPath
                );
            } else {
                await fsPromises.copyFile(inputPath, outputPath);
            }
        }
        
        // 5. Combine frames back into video
        const processedVideoPath = path.join(TEMP_DIR, 'processed.mp4');
        await combineFrames(framesDir, processedVideoPath);
        
        // 6. Add audio to video
        const finalOutputPath = path.join(OUTPUT_DIR, `${Date.now()}.mp4`);
        await new Promise((resolve, reject) => {
            ffmpeg()
                .input(processedVideoPath)
                .input(audioPath)
                .videoCodec('libx264')
                .audioCodec('aac')
                .outputOptions([
                    '-pix_fmt yuv420p',
                    '-movflags +faststart',
                    '-r 30',
                    '-shortest'
                ])
                .output(finalOutputPath)
                .on('progress', (progress) => {
                    console.log('Processing: ' + progress.percent + '% done');
                })
                .on('end', () => {
                    console.log('Finished processing');
                    resolve();
                })
                .on('error', (err) => {
                    console.error('Error in final processing:', err);
                    reject(err);
                })
                .run();
        });
        
        // Cleanup temp files (commented out for debugging)
        await fsPromises.rm(TEMP_DIR, { recursive: true, force: true });
        await fsPromises.mkdir(TEMP_DIR);
        
        res.json({ 
            success: true, 
            outputPath: finalOutputPath,
            audioDuration,
            originalVideoDuration: await getMediaDuration(originalVideoPath),
            finalVideoDuration: await getMediaDuration(videoPath)
        });
        
    } catch (error) {
        console.error(error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});