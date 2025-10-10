import { NextResponse } from 'next/server';
import { emailService } from '@/lib/emailService';
import { ADMIN_EMAILS } from '@/lib/resend';

export const dynamic = 'force-dynamic';

/**
 * Simple email test - tidak perlu data karyawan
 * Endpoint: GET /api/test-email-simple
 */
export async function GET() {
  try {
    console.log('='.repeat(80));
    console.log('[TEST-SIMPLE] Testing email service');
    console.log('[TEST-SIMPLE] Environment check:');
    console.log('  - RESEND_API_KEY:', process.env.RESEND_API_KEY ? `SET ✓ (${process.env.RESEND_API_KEY.substring(0, 8)}...)` : 'NOT SET ✗');
    console.log('  - ADMIN_EMAILS:', ADMIN_EMAILS.join(', '));
    console.log('  - SENDER_EMAIL:', process.env.SENDER_EMAIL || 'onboarding@resend.dev');
    console.log('  - NODE_ENV:', process.env.NODE_ENV);
    console.log('='.repeat(80));

    // Data dummy untuk test
    const testData = {
      employeeName: 'John Doe (TEST)',
      unit: 'Cabang Jakarta (TEST)',
      contractEndDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toLocaleDateString('id-ID', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      daysRemaining: 15,
      dashboardLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/dashboard`,
    };

    console.log('[TEST-SIMPLE] Sending test email with dummy data...');
    console.log('[TEST-SIMPLE] Data:', testData);

    const emailResult = await emailService.sendReminderEmail(
      ADMIN_EMAILS,
      testData
    );

    console.log('[TEST-SIMPLE] Result:', emailResult);
    console.log('='.repeat(80));

    if (emailResult.success) {
      return NextResponse.json({
        success: true,
        message: '✓ Test email sent successfully!',
        emailId: emailResult.emailId,
        sentTo: ADMIN_EMAILS,
        testData: testData,
      });
    } else {
      return NextResponse.json({
        success: false,
        message: '✗ Failed to send test email',
        error: emailResult.error,
        debug: {
          resendApiKey: process.env.RESEND_API_KEY ? 'SET' : 'NOT SET',
          adminEmails: ADMIN_EMAILS,
          senderEmail: process.env.SENDER_EMAIL || 'onboarding@resend.dev',
        }
      }, { status: 500 });
    }

  } catch (error: unknown) {
    const err = error as Error;
    console.error('[TEST-SIMPLE] Error:', error);
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
