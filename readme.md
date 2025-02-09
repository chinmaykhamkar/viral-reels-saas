# Video Content Generator

A web application that generates video content by combining template videos with text content. It supports direct text input and Reddit post content, processes the text using Deepgram for timing, and combines it with template videos using FFmpeg.

## Demo

[Add your demo video here]

## Features

- Multiple video templates (Minecraft Parkour, Subway Surfers, Car Stunts)
- Support for direct text input and Reddit post content
- Real-time video preview on hover
- Automatic text-to-speech timing using Deepgram API
- Video processing with FFmpeg
- Video streaming with range request support

## Project Structure

```
video-content-generator/
├── frontend/
│   ├── public/
│   │   ├── video/
│   │   │   ├── template1.mp4
│   │   │   ├── template2.mp4
│   │   │   └── template3.mp4
│   │   ├── index.html
│   │   └── styles.css
│   └── src/
│       └── main.js
├── backend/
│   ├── routes/
│   │   ├── video.js
│   │   └── reddit.js
│   ├── services/
│   │   ├── deepgram.js
│   │   └── videoProcessor.js
│   ├── output/
│   └── server.js
├── package.json
└── README.md
```

## Prerequisites

- Node.js (v14 or higher)
- FFmpeg installed on your system
- Deepgram API key
- Reddit API credentials (if using Reddit functionality)

## Installation

### Backend Setup

```bash
# Clone the repository
git clone [your-repo-url]
cd video-content-generator

# Install backend dependencies
cd backend
npm install express axios dotenv ffmpeg-static @deepgram/sdk snoowrap

# Create .env file
cp .env.example .env

# Add your API keys to .env
DEEPGRAM_API_KEY=your_key_here
REDDIT_CLIENT_ID=your_id_here
REDDIT_CLIENT_SECRET=your_secret_here
REDDIT_USER_AGENT=your_app_name
```

### Frontend Setup

```bash
# Install frontend dependencies
cd frontend
npm install

# Build frontend assets
npm run build
```

### FFmpeg Installation

#### Ubuntu/Debian
```bash
sudo apt update
sudo apt install ffmpeg
```

#### macOS
```bash
brew install ffmpeg
```

#### Windows
Download from [FFmpeg official website](https://ffmpeg.org/download.html)

## Environment Variables

```env
DEEPGRAM_API_KEY=your_deepgram_api_key
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_USER_AGENT=your_reddit_user_agent
PORT=3000
OUTPUT_DIR=./output
```

## System Architecture

### Sequence Diagram

```mermaid
sequenceDiagram
    participant Client
    participant Server
    participant Deepgram
    participant Reddit
    participant FFmpeg

    Client->>Server: POST /process-video
    alt is Reddit post
        Server->>Reddit: Fetch post content
        Reddit-->>Server: Return post text
    end
    Server->>Deepgram: Process text for timing
    Deepgram-->>Server: Return word timestamps
    Server->>FFmpeg: Split template video
    FFmpeg-->>Server: Return video segments
    Server->>FFmpeg: Combine segments with text
    FFmpeg-->>Server: Return final video
    Server-->>Client: Return video URL
    Client->>Server: GET /video/:filename
    Server-->>Client: Stream video content
```

## API Endpoints

### POST /process-video
Process text content and generate video

**Request Body:**
```json
{
    "videoId": "template1",
    "text": "Your content here",
    "isRedditPost": false
}
```

### GET /videos
Get list of all generated videos

### GET /video/:filename
Stream a specific video file

## How It Works

1. **Content Input**: 
   - User selects a video template and inputs text content
   - System can fetch Reddit post content if URL is provided

2. **Text Processing**:
   - Text is sent to Deepgram API for analysis
   - Timestamps for each word are extracted
   - Text is processed for TTS generation

3. **Video Processing**:
   - Template video is split into segments based on text timing
   - FFmpeg combines video segments with processed text
   - Final video is generated and stored

4. **Video Delivery**:
   - Generated video is streamed to client
   - Supports range requests for efficient streaming
   - Videos are cached for future requests