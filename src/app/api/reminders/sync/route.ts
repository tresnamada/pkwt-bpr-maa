import { NextResponse } from 'next/server';
import { employeeService } from '@/lib/employeeService';
import { reminderDatabase } from '@/lib/reminderDatabase';

export const dynamic = 'force-dynamic';

/**
 * API untuk sync reminders dari employees collection
 * Endpoint: GET /api/reminders/sync
 */
export async function GET() {
  try {
    console.log('[SYNC] Starting reminder sync at:', new Date().toISOString());

    // Ambil semua employees
    const allEmployees = await employeeService.getAllEmployees();
    console.log(`[SYNC] Found ${allEmployees.length} employees`);

    // Sync ke reminders collection
    await reminderDatabase.syncRemindersFromEmployees(allEmployees);
    console.log('[SYNC] Sync completed successfully');

    // Get statistics
    const stats = await reminderDatabase.getStatistics();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      message: 'Reminders synced successfully',
      statistics: stats,
    });

  } catch (error: unknown) {
    const err = error as Error;
    console.error('[SYNC] Error syncing reminders:', error);
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
