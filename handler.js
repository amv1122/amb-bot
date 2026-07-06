/**
 * AMV WP BOT - Command Handler
 */

require('dotenv').config();
const { generateImage } = require('./imagegen');

const PREFIX = process.env.PREFIX || '!';
const BOT_NAME = process.env.BOT_NAME || 'AMV WP BOT';

function getText(msg) {
  const m = msg.message;
  return (
    m.conversation ||
    m.extendedTextMessage?.text ||
    m.imageMessage?.caption ||
    m.videoMessage?.caption ||
    ''
  );
}

async function handleMessage(sock, msg) {
  const from = msg.key.remoteJid;
  const text = getText(msg).trim();

  if (!text.startsWith(PREFIX)) return;

  const args = text.slice(PREFIX.length).trim().split(/\s+/);
  const command = args.shift().toLowerCase();

  switch (command) {
    case 'menu':
    case 'help': {
      const menuText = `
╭───「 *${BOT_NAME}* 」───╮

📜 *Available Commands*

1. ${PREFIX}menu - Show this menu
2. ${PREFIX}ping - Check if bot is alive
3. ${PREFIX}img <prompt> - Generate an AI image
   Example: ${PREFIX}img a dragon flying over mountains

╰────────────────────╯
`.trim();
      await sock.sendMessage(from, { text: menuText }, { quoted: msg });
      break;
    }

    case 'ping': {
      const start = Date.now();
      await sock.sendMessage(from, { text: '🏓 Pinging...' }, { quoted: msg });
      const latency = Date.now() - start;
      await sock.sendMessage(from, { text: `✅ Pong! ${latency}ms` });
      break;
    }

    case 'img':
    case 'image':
    case 'imagine': {
      const prompt = args.join(' ');
      if (!prompt) {
        await sock.sendMessage(
          from,
          { text: `⚠️ Please give a prompt.\nExample: ${PREFIX}img a cat wearing sunglasses` },
          { quoted: msg }
        );
        return;
      }

      await sock.sendMessage(from, { text: '🎨 Generating your image, please wait...' }, { quoted: msg });

      try {
        const imageBuffer = await generateImage(prompt);
        await sock.sendMessage(
          from,
          {
            image: imageBuffer,
            caption: `✅ *${BOT_NAME}*\n🖼️ Prompt: ${prompt}`,
          },
          { quoted: msg }
        );
      } catch (err) {
        console.error('Image generation failed:', err);
        await sock.sendMessage(
          from,
          { text: '❌ Sorry, image generation failed. Please try again later.' },
          { quoted: msg }
        );
      }
      break;
    }

    default:
      // Unknown command - stay silent to avoid spamming groups
      break;
  }
}

module.exports = { handleMessage };
