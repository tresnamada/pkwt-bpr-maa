import {  NextResponse } from 'next/server';
import { employeeService } from '@/lib/employeeService';
import { reminderDatabase } from '@/lib/reminderDatabase';
import { emailService } from '@/lib/emailService';
import { ADMIN_EMAILS } from '@/lib/resend';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

export async function GET() {
  try {
    console.log('[FORCE-SEND] ⚠️ WARNING: Force send mode - bypassing 24h cooldown');
    console.log('[FORCE-SEND] Starting at:', new Date().toISOString());

    // Step 1: Sync reminders dari employees
    console.log('[FORCE-SEND] Step 1: Syncing reminders from employees...');
    const allEmployees = await employeeService.getAllEmployees();
    await reminderDatabase.syncRemindersFromEmployees(allEmployees);
    console.log('[FORCE-SEND] Sync completed');

    // Step 2: Ambil SEMUA pending reminders (ignore lastEmailSent)
    console.log('[FORCE-SEND] Step 2: Getting ALL pending reminders (ignoring cooldown)...');
    const allPendingReminders = await reminderDatabase.getPendingReminders();
    console.log(`[FORCE-SEND] Found ${allPendingReminders.length} pending reminders`);

    const results = {
      total: allPendingReminders.length,
      sent: 0,
      failed: 0,
      details: [] as Array<{
        reminderId: string;
        employeeName: string;
        status: string;
        priority?: string;
        daysRemaining?: number;
        lastEmailSent?: string;
        emailId?: string;
        error?: string;
      }>,
    };

    // Step 3: Kirim email untuk SEMUA pending reminders (force send)
    for (const reminder of allPendingReminders) {
      const lastSentInfo = reminder.lastEmailSent 
        ? `last sent ${((new Date().getTime() - reminder.lastEmailSent.getTime()) / (1000 * 60 * 60)).toFixed(1)}h ago`
        : 'never sent';
      
      console.log(`[FORCE-SEND] Processing ${reminder.employeeName} (${reminder.priority} priority, ${lastSentInfo})`);

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
          lastEmailSent: reminder.lastEmailSent?.toISOString(),
          emailId: emailResult.emailId,
        });
        console.log(`[FORCE-SEND] ✓ Email sent for ${reminder.employeeName}`);
      } else {
        results.failed++;
        results.details.push({
          reminderId: reminder.id,
          employeeName: reminder.employeeName,
          status: 'failed',
          error: emailResult.error,
        });
        console.error(`[FORCE-SEND] ✗ Failed to send email for ${reminder.employeeName}:`, emailResult.error);
      }
    }

    // Get final statistics
    const stats = await reminderDatabase.getStatistics();

    console.log('[FORCE-SEND] Job completed:', results);
    console.log('[FORCE-SEND] ⚠️ Note: This bypassed the 24-hour cooldown. Use only for testing!');

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      warning: 'This endpoint bypasses the 24-hour cooldown. Use only for testing!',
      results,
      statistics: stats,
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('[FORCE-SEND] Error in force-send-reminders job:', error);
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
