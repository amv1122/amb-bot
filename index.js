/**
 * ================================================
 *   AMV WP BOT
 *   WhatsApp Bot with Pairing Code Login + Image Gen
 * ================================================
 */

require('dotenv').config();
const path = require('path');
const readline = require('readline');
const pino = require('pino');
const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  fetchLatestBaileysVersion,
  Browsers,
} = require('@whiskeysockets/baileys');
const { Boom } = require('@hapi/boom');

const { handleMessage } = require('./commands/handler');

const SESSION_DIR = path.join(__dirname, 'session');
const BOT_NAME = process.env.BOT_NAME || 'AMV WP BOT';

const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
const question = (text) => new Promise((resolve) => rl.question(text, resolve));

async function startBot() {
  const { state, saveCreds } = await useMultiFileAuthState(SESSION_DIR);
  const { version } = await fetchLatestBaileysVersion();

  const sock = makeWASocket({
    version,
    auth: state,
    printQRInTerminal: false, // we use pairing code, not QR
    logger: pino({ level: 'silent' }),
    browser: Browsers.macOS('Chrome'),
  });

  // ---- PAIRING CODE LOGIN ----
  if (!sock.authState.creds.registered) {
    let phoneNumber = process.env.PHONE_NUMBER;

    if (!phoneNumber) {
      phoneNumber = await question(
        'Enter your WhatsApp number with country code (e.g. 94712345678): '
      );
    }
    phoneNumber = phoneNumber.replace(/[^0-9]/g, '');

    setTimeout(async () => {
      try {
        const code = await sock.requestPairingCode(phoneNumber);
        console.log('\n========================================');
        console.log(`   ${BOT_NAME} - PAIRING CODE`);
        console.log('========================================');
        console.log(`   Your pairing code: ${code}`);
        console.log('   Open WhatsApp > Linked Devices >');
        console.log('   Link a Device > Link with phone number');
        console.log('   and enter this code.');
        console.log('========================================\n');
      } catch (err) {
        console.error('Failed to get pairing code:', err);
      }
    }, 3000);
  }

  // ---- CONNECTION HANDLING ----
  sock.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'close') {
      const statusCode = new Boom(lastDisconnect?.error)?.output?.statusCode;
      const shouldReconnect = statusCode !== DisconnectReason.loggedOut;
      console.log('Connection closed. Reconnecting:', shouldReconnect);
      if (shouldReconnect) {
        startBot();
      } else {
        console.log('Logged out. Delete the "session" folder and restart to re-pair.');
      }
    } else if (connection === 'open') {
      console.log(`\n✅ ${BOT_NAME} is now connected and online!\n`);
    }
  });

  sock.ev.on('creds.update', saveCreds);

  // ---- MESSAGE HANDLING ----
  sock.ev.on('messages.upsert', async ({ messages, type }) => {
    if (type !== 'notify') return;
    const msg = messages[0];
    if (!msg.message || msg.key.fromMe) return;

    try {
      await handleMessage(sock, msg);
    } catch (err) {
      console.error('Error handling message:', err);
    }
  });

  return sock;
}

startBot().catch((err) => console.error('Fatal error starting bot:', err));
