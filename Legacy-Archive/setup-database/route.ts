//this is to test and create the initial database
import { NextRequest, NextResponse } from 'next/server';
import { initializeDatabase, createSampleData } from '../../../lib/initializeDatabase';

export async function POST(request: NextRequest) {
  try {
    const { action } = await request.json();

    if (action === 'initialize') {
      await initializeDatabase();
      return NextResponse.json({ 
        message: 'Database initialized successfully with complete field structures',
        collections: [
          'categories (with initial data)',
          'users (with field structure)',
          'userProfiles (with field structure)', 
          'items (with field structure)',
          'itemPhotos (with field structure)',
          'carts (with field structure)',
          'cartItems (with field structure)',
          'orders (with field structure)',
          'orderItems (with field structure)',
          'payments (with field structure)',
          'messages (with field structure)'
        ],
        note: 'All collections now include proper field structures based on database planning documents'
      });
    } else if (action === 'sample-data') {
      await createSampleData();
      return NextResponse.json({ 
        message: 'Additional sample data created successfully',
        note: 'Created realistic sample data for testing purposes'
      });
    } else {
      return NextResponse.json({ 
        message: 'Invalid action. Use "initialize" or "sample-data"',
        availableActions: ['initialize', 'sample-data']
      }, { status: 400 });
    }

  } catch (error) {
    console.error('Database setup error:', error);
    return NextResponse.json({ 
      message: 'Database setup failed', 
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Handle other HTTP methods
export async function GET() {
  return NextResponse.json({
    message: 'Database setup endpoint',
    availableActions: ['initialize', 'sample-data'],
    usage: 'POST with { "action": "initialize" } or { "action": "sample-data" }'
  });
}
