import { NextRequest, NextResponse } from 'next/server';
import { reminderDatabase } from '@/lib/reminderDatabase';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');

    let reminders;

    if (priority) {
      reminders = await reminderDatabase.getRemindersByPriority(priority as 'low' | 'medium' | 'high' | 'urgent');
    } else if (status === 'pending' || status === 'notified') {
      reminders = await reminderDatabase.getPendingReminders();
    } else {
      reminders = await reminderDatabase.getAllReminders();
    }

    // Get statistics
    const stats = await reminderDatabase.getStatistics();

    return NextResponse.json({
      success: true,
      count: reminders.length,
      reminders: reminders,
      statistics: stats,
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('[API] Error fetching reminders:', error);
    return NextResponse.json(
      {
        success: false,
        error: err.message || 'Unknown error occurred',
      },
      { status: 500 }
    );
  }
}
