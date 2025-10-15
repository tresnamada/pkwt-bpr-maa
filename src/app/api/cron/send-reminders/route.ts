import { NextRequest, NextResponse } from 'next/server';
import { employeeService } from '@/lib/employeeService';
import { emailService } from '@/lib/emailService';
import { ADMIN_EMAILS } from '@/lib/resend';

export const dynamic = 'force-dynamic';
export const maxDuration = 60; // Maximum 60 seconds for cron job

export async function GET(request: NextRequest) {
  try {
    // Verifikasi bahwa request berasal dari Vercel Cron
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    // Only check auth in production or if CRON_SECRET is explicitly set
    // For local testing, allow access without auth
    const isProduction = process.env.NODE_ENV === 'production';
    const shouldCheckAuth = cronSecret && isProduction;

    if (shouldCheckAuth && authHeader !== `Bearer ${cronSecret}`) {
      console.log('[CRON] Unauthorized access attempt');
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[CRON] Starting email reminder job at:', new Date().toISOString());
    console.log('[CRON] Environment:', process.env.NODE_ENV);
    console.log('[CRON] Auth check:', shouldCheckAuth ? 'enabled' : 'disabled');

    const allEmployees = await employeeService.getAllEmployees();
    const activeEmployees = allEmployees.filter(emp => emp.status === 'active');

    console.log(`[CRON] Found ${activeEmployees.length} active employees`);

    const now = new Date();
    const employeesNeedingReminder = activeEmployees.filter(emp => {
      const daysRemaining = emailService.calculateDaysRemaining(emp.contractEndDate);
      const needsReminder = daysRemaining <= 30 && daysRemaining > 0;
      console.log(`[CRON] Checking ${emp.name}: ${daysRemaining} days remaining, needsReminder: ${needsReminder}`);
      return needsReminder;
    });

    console.log(`[CRON] Found ${employeesNeedingReminder.length} employees needing reminder`);

    const unevaluatedEmployees = await employeeService.getUnevaluatedNeedingEmailReminder();
    console.log(`[CRON] Found ${unevaluatedEmployees.length} unevaluated employees needing email reminder (30+ days expired)`);
    
    if (employeesNeedingReminder.length > 0) {
      console.log('[CRON] Employees needing reminder:', employeesNeedingReminder.map(e => ({
        name: e.name,
        contractEndDate: e.contractEndDate,
        lastReminderEmailSent: e.lastReminderEmailSent
      })));
    }

    const allEmployeesNeedingEmail = [...employeesNeedingReminder, ...unevaluatedEmployees];

    const results = {
      total: allEmployeesNeedingEmail.length,
      activeReminders: employeesNeedingReminder.length,
      unevaluatedReminders: unevaluatedEmployees.length,
      sent: 0,
      skipped: 0,
      failed: 0,
      details: [] as Array<{
        employeeName: string;
        status: string;
        reason?: string;
        lastEmailSent?: Date;
        emailId?: string;
        daysRemaining?: number;
        error?: string;
      }>,
    };

    for (const employee of allEmployeesNeedingEmail) {
      const daysRemaining = emailService.calculateDaysRemaining(employee.contractEndDate);
      
      const shouldSend = emailService.shouldSendEmail(employee.lastReminderEmailSent);
      
      console.log(`[CRON] Processing ${employee.name}:`, {
        lastReminderEmailSent: employee.lastReminderEmailSent,
        shouldSend: shouldSend,
        status: employee.status,
        daysRemaining: daysRemaining
      });
      
      if (!shouldSend) {
        console.log(`[CRON] Skipping ${employee.name} - Email already sent in last 24 hours`);
        results.skipped++;
        results.details.push({
          employeeName: employee.name,
          status: 'skipped',
          reason: 'Email already sent in last 24 hours',
          lastEmailSent: employee.lastReminderEmailSent,
        });
        continue;
      }

      // Tentukan jenis reminder berdasarkan status
      const isUnevaluated = employee.status === 'expired';
      const daysSinceExpired = isUnevaluated 
        ? Math.floor((now.getTime() - employee.contractEndDate.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      // Siapkan data email
      const emailData = {
        employeeName: employee.name,
        unit: employee.unit,
        contractEndDate: emailService.formatDate(employee.contractEndDate),
        daysRemaining: isUnevaluated ? -daysSinceExpired : daysRemaining,
        dashboardLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
      };

      // Kirim email ke semua admin
      const emailType = isUnevaluated ? 'UNEVALUATED' : 'REMINDER';
      console.log(`[CRON] Sending ${emailType} email for ${employee.name} (${isUnevaluated ? daysSinceExpired + ' days overdue' : daysRemaining + ' days remaining'}) to ${ADMIN_EMAILS.length} admin(s)`);
      const emailResult = await emailService.sendReminderEmail(
        ADMIN_EMAILS,
        emailData
      );

      if (emailResult.success) {
        // Update tracking di Firestore
        await employeeService.updateEmailTracking(employee.id);
        results.sent++;
        results.details.push({
          employeeName: employee.name,
          status: 'sent',
          emailId: emailResult.emailId,
          daysRemaining: daysRemaining,
        });
        console.log(`[CRON] ✓ Email sent successfully for ${employee.name}`);
      } else {
        results.failed++;
        results.details.push({
          employeeName: employee.name,
          status: 'failed',
          error: emailResult.error,
        });
        console.error(`[CRON] ✗ Failed to send email for ${employee.name}:`, emailResult.error);
      }
    }

    console.log('[CRON] Job completed:', results);

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('[CRON] Error in send-reminders job:', error);
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
