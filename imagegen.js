/**
 * AMV WP BOT - Image Generation Module
 * Uses Pollinations AI (free, no API key required)
 */

require('dotenv').config();
const fetch = require('node-fetch');

const IMAGE_API_URL = process.env.IMAGE_API_URL || 'https://image.pollinations.ai/prompt/';

async function generateImage(prompt) {
  const seed = Math.floor(Math.random() * 1000000);
  const encodedPrompt = encodeURIComponent(prompt);
  const url = `${IMAGE_API_URL}${encodedPrompt}?width=1024&height=1024&seed=${seed}&nologo=true`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Image API returned status ${response.status}`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

module.exports = { generateImage };
