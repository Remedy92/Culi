import { kv } from '@vercel/kv';
import { NextRequest, NextResponse } from 'next/server';

// Example of correct Redis/KV usage in this project

export async function GET() {
  try {
    // Get a specific key
    const result = await kv.get<string>('item');
    
    return NextResponse.json({ result });
  } catch (error) {
    console.error('Redis GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch from cache' },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { key, value, ttl } = body;

    if (!key || value === undefined) {
      return NextResponse.json(
        { error: 'Key and value are required' },
        { status: 400 }
      );
    }

    // Set with optional TTL (in seconds)
    if (ttl) {
      await kv.set(key, value, { ex: ttl });
    } else {
      await kv.set(key, value);
    }
    
    return NextResponse.json({ success: true, key, value });
  } catch (error) {
    console.error('Redis SET error:', error);
    return NextResponse.json(
      { error: 'Failed to save to cache' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json(
        { error: 'Key is required' },
        { status: 400 }
      );
    }

    await kv.del(key);
    
    return NextResponse.json({ success: true, deleted: key });
  } catch (error) {
    console.error('Redis DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete from cache' },
      { status: 500 }
    );
  }
}