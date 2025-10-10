import {  NextResponse } from 'next/server';
import { employeeService } from '@/lib/employeeService';
import { emailService } from '@/lib/emailService';
import { ADMIN_EMAILS } from '@/lib/resend';

export const dynamic = 'force-dynamic';


export async function GET() {
  try {
    console.log('='.repeat(80));
    console.log('[TEST] Starting manual email test');
    console.log('[TEST] Environment check:');
    console.log('  - RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'SET' : 'NOT SET');
    console.log('  - ADMIN_EMAILS:', process.env.ADMIN_EMAILS || process.env.ADMIN_EMAIL || 'NOT SET (using default)');
    console.log('  - SENDER_EMAIL:', process.env.SENDER_EMAIL || 'NOT SET (using default)');
    console.log('  - Target Emails:', ADMIN_EMAILS.join(', '));
    console.log('  - Total Admins:', ADMIN_EMAILS.length);
    console.log('='.repeat(80));

    // 1. Ambil semua karyawan
    console.log('\n[TEST] Step 1: Fetching all employees...');
    const allEmployees = await employeeService.getAllEmployees();
    console.log(`[TEST] Total employees: ${allEmployees.length}`);
    
    // Group by status
    const byStatus = allEmployees.reduce((acc, emp) => {
      acc[emp.status] = (acc[emp.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    console.log('[TEST] Employees by status:', byStatus);

    // 2. Filter karyawan aktif
    console.log('\n[TEST] Step 2: Filtering active employees...');
    const activeEmployees = allEmployees.filter(emp => emp.status === 'active');
    console.log(`[TEST] Active employees: ${activeEmployees.length}`);
    
    if (activeEmployees.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No active employees found',
        debug: { byStatus }
      });
    }

    // 3. Cek sisa hari untuk setiap karyawan aktif
    console.log('\n[TEST] Step 3: Calculating days remaining for each active employee...');
    const employeesWithDays = activeEmployees.map(emp => {
      const daysRemaining = emailService.calculateDaysRemaining(emp.contractEndDate);
      return {
        id: emp.id,
        name: emp.name,
        unit: emp.unit,
        contractEndDate: emp.contractEndDate,
        daysRemaining: daysRemaining,
        needsReminder: daysRemaining <= 30 && daysRemaining > 0,
        lastReminderEmailSent: emp.lastReminderEmailSent,
        emailReminderCount: emp.emailReminderCount || 0,
      };
    });

    console.log('[TEST] Employee details with days remaining:');
    employeesWithDays.forEach(emp => {
      console.log(`  - ${emp.name}: ${emp.daysRemaining} days (needs reminder: ${emp.needsReminder})`);
    });

    // 4. Filter yang perlu reminder
    console.log('\n[TEST] Step 4: Filtering employees needing reminder...');
    const needingReminder = employeesWithDays.filter(emp => emp.needsReminder);
    console.log(`[TEST] Employees needing reminder: ${needingReminder.length}`);

    if (needingReminder.length === 0) {
      return NextResponse.json({
        success: false,
        message: 'No employees need reminder at this time',
        debug: {
          totalEmployees: allEmployees.length,
          activeEmployees: activeEmployees.length,
          employeesWithDays: employeesWithDays,
        }
      });
    }

    // 5. Coba kirim email untuk employee pertama yang perlu reminder
    console.log('\n[TEST] Step 5: Sending test email...');
    const testEmployee = needingReminder[0];
    console.log('[TEST] Sending email for:', testEmployee.name);

    const emailData = {
      employeeName: testEmployee.name,
      unit: testEmployee.unit,
      contractEndDate: emailService.formatDate(testEmployee.contractEndDate),
      daysRemaining: testEmployee.daysRemaining,
      dashboardLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
    };

    console.log('[TEST] Email data:', emailData);
    console.log(`[TEST] Sending to ${ADMIN_EMAILS.length} admin(s):`, ADMIN_EMAILS);
    
    const emailResult = await emailService.sendReminderEmail(
      ADMIN_EMAILS,
      emailData
    );

    console.log('[TEST] Email result:', emailResult);

    if (emailResult.success) {
      console.log('[TEST] ✓ Email sent successfully!');
      // Update tracking in Firestore
      await employeeService.updateEmailTracking(testEmployee.id);
      console.log('[TEST] ✓ Email tracking updated in Firestore');
    } else {
      console.error('[TEST] ✗ Failed to send email:', emailResult.error);
    }

    console.log('='.repeat(80));

    return NextResponse.json({
      success: emailResult.success,
      message: emailResult.success 
        ? 'Test email sent successfully!' 
        : 'Failed to send test email',
      debug: {
        totalEmployees: allEmployees.length,
        activeEmployees: activeEmployees.length,
        needingReminder: needingReminder.length,
        testEmployee: {
          name: testEmployee.name,
          daysRemaining: testEmployee.daysRemaining,
        },
        emailResult: emailResult,
        targetEmails: ADMIN_EMAILS,
        totalAdmins: ADMIN_EMAILS.length,
      }
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('[TEST] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Unknown error occurred',
        stack: err.stack,
      },
      { status: 500 }
    );
  }
}
