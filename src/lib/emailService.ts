import { resend, SENDER_EMAIL, ADMIN_EMAIL, ADMIN_EMAILS } from './resend';
import { generateReminderEmailHTML, generateReminderEmailText } from './emailTemplates';
import { EmailReminderData, SendEmailResult } from '@/types/email';

export const emailService = {
  async sendReminderEmail(
    adminEmail: string | string[],
    data: EmailReminderData
  ): Promise<SendEmailResult> {
    try {
      // Check if Resend is initialized
      if (!resend) {
        console.error('Resend client is not initialized. Check RESEND_API_KEY.');
        return {
          success: false,
          error: 'Resend client not initialized',
        };
      }

      // Convert to array of recipients
      const recipients = Array.isArray(adminEmail) 
        ? adminEmail 
        : (typeof adminEmail === 'string' ? [adminEmail] : ADMIN_EMAILS);

      console.log('[EMAIL] Preparing to send emails to:', recipients);

      const isOverdue = data.daysRemaining < 0;
      const subjectLine = isOverdue
        ? `🚨 URGENT - Evaluasi Tertunda ${Math.abs(data.daysRemaining)} Hari - ${data.employeeName}`
        : `⚠️ Pengingat Evaluasi PKWT - ${data.employeeName} (${data.daysRemaining} hari lagi)`;

      // Send email to each recipient individually
      // This ensures better deliverability and avoids Resend's multiple recipient issues
      const results = [];
      const errors = [];

      for (const recipient of recipients) {
        try {
          const emailPayload = {
            from: `BPR MAA - Sistem PKWT <${SENDER_EMAIL}>`,
            to: recipient, // Send to ONE recipient at a time
            subject: subjectLine,
            html: generateReminderEmailHTML(data),
            text: generateReminderEmailText(data),
            // Headers to improve deliverability dan avoid spam
            headers: {
              'X-Entity-Ref-ID': `pkwt-${Date.now()}-${recipient}`,
              'X-Priority': '1',
              'Importance': 'high',
              'X-Mailer': 'BPR-MAA-PKWT-System',
              'X-Auto-Response-Suppress': 'OOF, DR, RN, NRN, AutoReply',
              'List-Unsubscribe': `<mailto:noreply@bprmaa.com?subject=unsubscribe>`,
            },
            // Add reply-to for better deliverability
            replyTo: ADMIN_EMAIL,
          };

          console.log(`[EMAIL] Sending to: ${recipient}`);

          const response = await resend.emails.send(emailPayload);

          if (response.error) {
            console.error(`[EMAIL] ✗ Failed to send to ${recipient}:`, response.error);
            errors.push({
              recipient,
              error: response.error.message || 'Failed to send email',
            });
          } else {
            console.log(`[EMAIL] ✓ Successfully sent to ${recipient}:`, response.data?.id);
            results.push({
              recipient,
              emailId: response.data?.id,
            });
          }

          // Add small delay between emails to avoid rate limiting
          if (recipients.length > 1) {
            await new Promise(resolve => setTimeout(resolve, 100));
          }
        } catch (error: unknown) {
          const err = error as Error;
          console.error(`[EMAIL] ✗ Exception sending to ${recipient}:`, error);
          errors.push({
            recipient,
            error: err.message || 'Unknown error occurred',
          });
        }
      }

      // Return success if at least one email was sent
      if (results.length > 0) {
        console.log(`[EMAIL] Summary: ${results.length}/${recipients.length} emails sent successfully`);
        if (errors.length > 0) {
          console.warn('[EMAIL] Some emails failed:', errors);
        }
        return {
          success: true,
          emailId: results.map(r => r.emailId).join(', '),
          message: `Sent to ${results.length}/${recipients.length} recipients`,
        };
      } else {
        console.error('[EMAIL] All emails failed to send');
        return {
          success: false,
          error: `Failed to send to all recipients: ${errors.map(e => `${e.recipient}: ${e.error}`).join('; ')}`,
        };
      }
    } catch (error: unknown) {
      const err = error as Error;
      console.error('[EMAIL] Fatal error in sendReminderEmail:', error);
      return {
        success: false,
        error: err.message || 'Unknown error occurred',
      };
    }
  },


  shouldSendEmail(lastEmailSent?: Date): boolean {
    if (!lastEmailSent) {
      return true;
    }

    const now = new Date();
    const timeDiff = now.getTime() - lastEmailSent.getTime();
    const hoursDiff = timeDiff / (1000 * 60 * 60);

    // Kirim email jika sudah lebih dari 24 jam
    return hoursDiff >= 24;
  },

  /**
   * Hitung sisa hari kontrak
   * Menggunakan date-only comparison untuk menghindari masalah timezone
   */
  calculateDaysRemaining(contractEndDate: Date): number {
    // Normalize both dates to midnight to avoid timezone issues
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    
    const endDate = new Date(contractEndDate);
    endDate.setHours(0, 0, 0, 0);
    
    const timeDiff = endDate.getTime() - now.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    console.log('[EMAIL] calculateDaysRemaining:', {
      today: now.toISOString(),
      endDate: endDate.toISOString(),
      daysRemaining: daysDiff
    });
    
    return daysDiff;
  },

  /**
   * Format tanggal untuk email
   */
  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('id-ID', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  },
};
