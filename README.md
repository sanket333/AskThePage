# Ask The Page - Chrome Extension

A Chrome extension that adds a floating chatbot to any webpage, allowing users to ask questions about the page content using AI.

## Features

- 🤖 **Floating Chatbot**: Appears at the bottom-right of any webpage
- 📄 **Page Context**: Automatically analyzes the current page content
- 🎨 **Beautiful UI**: Custom-styled chat interface with gradients and animations
- ⚡ **Instant Responses**: Direct API integration for fast responses

## Architecture

The extension consists of:
- `manifest.json` - Extension configuration
- `floating-chatbot.js` - Content script that creates the floating chat interface
- `backend/` - Node.js backend with OpenAI integration (optional)

## Installation

1. Clone this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked" and select this directory
5. The floating chatbot will appear on any webpage you visit

## Backend Setup (Optional)

If you want to use the AI functionality:

1. Navigate to the `backend/` directory
2. Install dependencies: `npm install`
3. Create a `.env` file with your OpenAI API key
4. Start the server: `npm start`
5. The chatbot will connect to `localhost:5001`

## Usage

1. Visit any webpage
2. Click the floating chat button at the bottom-right
3. Ask questions about the page content
4. Get AI-powered responses based on the page context
