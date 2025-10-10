import { Resend } from 'resend';

// Initialize Resend with API key
// Note: API key will be loaded from environment variables at runtime
export const resend = process.env.RESEND_API_KEY 
  ? new Resend(process.env.RESEND_API_KEY)
  : null;

// Default sender email (akan dikonfigurasi di Resend dashboard)
export const SENDER_EMAIL = process.env.SENDER_EMAIL || 'onboarding@resend.dev';

// Admin emails yang akan menerima notifikasi (support multiple admins)
// Format: email1,email2,email3 (dipisah koma)
const adminEmailsEnv = process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || 'muliawanl18@gmail.com';
export const ADMIN_EMAILS = adminEmailsEnv.split(',').map(email => email.trim()).filter(email => email.length > 0);

// Backward compatibility - single admin email
export const ADMIN_EMAIL = ADMIN_EMAILS[0];
