/**
 * Runs once when the Next.js server starts (Node only).
 * Prefer IPv4 for outbound connections so SMTP and Twilio work from cloud runtimes
 * (e.g. Railway) where IPv6 may be unreachable (ENETUNREACH).
 */
export function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const dns = require('dns');
    dns.setDefaultResultOrder('ipv4first');
  }
}
