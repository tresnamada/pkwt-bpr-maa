import { NextRequest, NextResponse } from 'next/server';
import { employeeService } from '@/lib/employeeService';
import { reminderDatabase } from '@/lib/reminderDatabase';
import { emailService } from '@/lib/emailService';
import { ADMIN_EMAILS } from '@/lib/resend';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * Cron job v2 - Menggunakan reminders database
 * Endpoint: GET /api/cron/send-reminders-v2
 */
export async function GET(request: NextRequest) {
  try {
    // Verifikasi auth
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;
    const isProduction = process.env.NODE_ENV === 'production';
    const shouldCheckAuth = cronSecret && isProduction;

    if (shouldCheckAuth && authHeader !== `Bearer ${cronSecret}`) {
      console.log('[CRON-V2] Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('[CRON-V2] Starting reminder job at:', new Date().toISOString());

    // Step 1: Sync reminders dari employees
    console.log('[CRON-V2] Step 1: Syncing reminders from employees...');
    const allEmployees = await employeeService.getAllEmployees();
    await reminderDatabase.syncRemindersFromEmployees(allEmployees);
    console.log('[CRON-V2] Sync completed');

    // Step 2: Ambil reminders yang perlu kirim email
    console.log('[CRON-V2] Step 2: Getting reminders needing email...');
    const remindersNeedingEmail = await reminderDatabase.getRemindersNeedingEmail();
    console.log(`[CRON-V2] Found ${remindersNeedingEmail.length} reminders needing email`);

    const results = {
      total: remindersNeedingEmail.length,
      sent: 0,
      failed: 0,
      details: [] as Array<{
        reminderId: string;
        employeeName: string;
        status: string;
        priority?: string;
        daysRemaining?: number;
        emailId?: string;
        error?: string;
      }>,
    };

    // Step 3: Kirim email untuk setiap reminder
    for (const reminder of remindersNeedingEmail) {
      console.log(`[CRON-V2] Processing reminder for ${reminder.employeeName} (${reminder.priority} priority)`);

      const emailData = {
        employeeName: reminder.employeeName,
        unit: reminder.unit,
        contractEndDate: emailService.formatDate(reminder.contractEndDate),
        daysRemaining: reminder.daysRemaining,
        dashboardLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
      };

      const emailResult = await emailService.sendReminderEmail(ADMIN_EMAILS, emailData);

      if (emailResult.success) {
        // Update reminder status
        await reminderDatabase.markAsNotified(reminder.id);
        results.sent++;
        results.details.push({
          reminderId: reminder.id,
          employeeName: reminder.employeeName,
          status: 'sent',
          priority: reminder.priority,
          daysRemaining: reminder.daysRemaining,
          emailId: emailResult.emailId,
        });
        console.log(`[CRON-V2] ✓ Email sent for ${reminder.employeeName}`);
      } else {
        results.failed++;
        results.details.push({
          reminderId: reminder.id,
          employeeName: reminder.employeeName,
          status: 'failed',
          error: emailResult.error,
        });
        console.error(`[CRON-V2] ✗ Failed to send email for ${reminder.employeeName}:`, emailResult.error);
      }
    }

    // Get final statistics
    const stats = await reminderDatabase.getStatistics();

    console.log('[CRON-V2] Job completed:', results);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
      statistics: stats,
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('[CRON-V2] Error in send-reminders-v2 job:', error);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Unknown error occurred',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
