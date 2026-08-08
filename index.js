// This is the default entry point most hosting panels (Render, Railway,
// Pterodactyl/KataBump, etc.) run automatically — it just boots the full
// Express + Socket.IO website, which itself starts the WhatsApp connection
// and auto-pairing. See server.js for the actual implementation.
//
// Prefer pure CLI/terminal pairing with no website? Run cli.js instead.
require('./server');
