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

      const recipients = Array.isArray(adminEmail) 
        ? adminEmail 
        : (adminEmail || ADMIN_EMAILS);

      const isOverdue = data.daysRemaining < 0;
      const subjectLine = isOverdue
        ? `🚨 URGENT - Evaluasi Tertunda ${Math.abs(data.daysRemaining)} Hari - ${data.employeeName}`
        : `⚠️ Pengingat Evaluasi PKWT - ${data.employeeName} (${data.daysRemaining} hari lagi)`;

      const emailPayload = {
        from: `BPR MAA - Sistem PKWT <${SENDER_EMAIL}>`,
        to: recipients,
        subject: subjectLine,
        html: generateReminderEmailHTML(data),
        text: generateReminderEmailText(data),
        // Headers to improve deliverability dan avoid spam
        headers: {
          'X-Entity-Ref-ID': `pkwt-${Date.now()}`,
          'X-Priority': '1',
          'Importance': 'high',
          'X-Mailer': 'BPR-MAA-PKWT-System',
          'X-Auto-Response-Suppress': 'OOF, DR, RN, NRN, AutoReply',
          'List-Unsubscribe': `<mailto:noreply@bprmaa.com?subject=unsubscribe>`,
        },
        // Add reply-to for better deliverability
        replyTo: ADMIN_EMAIL,
        // Tags disabled temporarily due to ASCII validation issues
        // tags: [
        //   {
        //     name: 'category',
        //     value: 'pkwt-reminder'
        //   },
        //   {
        //     name: 'employee',
        //     value: data.employeeName
        //       .replace(/[^a-zA-Z0-9\s-]/g, '')
        //       .replace(/\s+/g, '-')
        //       .toLowerCase()
        //       .substring(0, 50)
        //   }
        // ]
      };

      console.log('[EMAIL] Sending email with payload:', {
        from: emailPayload.from,
        to: emailPayload.to,
      });

      const response = await resend.emails.send(emailPayload);

      if (response.error) {
        console.error('[EMAIL] Resend API error:', response.error);
        return {
          success: false,
          error: response.error.message || 'Failed to send email',
        };
      }

      console.log('[EMAIL] ✓ Email sent successfully:', {
        emailId: response.data?.id,
        to: emailPayload.to,
      });

      return {
        success: true,
        emailId: response.data?.id,
      };
    } catch (error: unknown) {
      const err = error as Error;
      console.error('Error sending email:', error);
      return {
        success: false,
        error: err.message || 'Unknown error occurred',
      };
    }
  },

  /**
   * Cek apakah email sudah dikirim dalam 24 jam terakhir
   */
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
