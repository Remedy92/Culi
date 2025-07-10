import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { createClient } from '@supabase/supabase-js';
import { z } from 'zod';
import crypto from 'crypto';
import { EXTRACTION_CONFIG } from '@/lib/config/extraction';

export const runtime = 'nodejs';

// Initialize Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Validation schemas
const UploadSchema = z.object({
  restaurantId: z.string().uuid('Invalid restaurant ID format')
});

export async function POST(req: NextRequest) {
  try {
    // Parse multipart form data
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const restaurantId = formData.get('restaurantId') as string | null;

    // Validate inputs
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!restaurantId) {
      return NextResponse.json(
        { error: 'Restaurant ID is required' },
        { status: 400 }
      );
    }

    // Validate restaurant ID format
    try {
      UploadSchema.parse({ restaurantId });
    } catch {
      return NextResponse.json(
        { error: 'Invalid restaurant ID format' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!EXTRACTION_CONFIG.UPLOAD.ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, PDF' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > EXTRACTION_CONFIG.UPLOAD.MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: `File too large. Maximum size: ${EXTRACTION_CONFIG.UPLOAD.MAX_FILE_SIZE / 1024 / 1024}MB` },
        { status: 400 }
      );
    }

    // Verify restaurant exists and user has access
    const { data: restaurant, error: restaurantError } = await supabase
      .from('restaurants')
      .select('id, name')
      .eq('id', restaurantId)
      .single();

    if (restaurantError || !restaurant) {
      return NextResponse.json(
        { error: 'Restaurant not found or access denied' },
        { status: 404 }
      );
    }

    // Convert file to buffer
    const buffer = Buffer.from(await file.arrayBuffer());
    const fileId = crypto.randomUUID();
    const fileExt = file.name.split('.').pop() || 'jpg';

    // Upload original file to Vercel Blob
    const originalBlob = await put(
      `menus/${restaurantId}/${fileId}/original.${fileExt}`,
      buffer,
      {
        access: 'public',
        addRandomSuffix: false,
        contentType: file.type
      }
    );

    let thumbnailUrl = originalBlob.url;
    let enhancedUrl = originalBlob.url;

    // Process images (not PDFs)
    if (file.type.startsWith('image/')) {
      // Dynamically import Sharp to reduce bundle size
      const sharp = (await import('sharp')).default;
      
      // Create enhanced thumbnail for OCR
      const thumbnailBuffer = await sharp(buffer)
        .resize(1024, 1024, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .normalize() // Improve contrast
        .sharpen()   // Enhance text clarity
        .jpeg({ quality: 90 })
        .toBuffer();

      const thumbnailBlob = await put(
        `menus/${restaurantId}/${fileId}/thumbnail.jpg`,
        thumbnailBuffer,
        {
          access: 'public',
          addRandomSuffix: false,
          contentType: 'image/jpeg'
        }
      );
      thumbnailUrl = thumbnailBlob.url;

      // Create high-quality enhanced version
      const enhancedBuffer = await sharp(buffer)
        .resize(2048, 2048, { 
          fit: 'inside',
          withoutEnlargement: true 
        })
        .normalize()
        .sharpen({ sigma: 2 })
        .jpeg({ quality: 95 })
        .toBuffer();

      const enhancedBlob = await put(
        `menus/${restaurantId}/${fileId}/enhanced.jpg`,
        enhancedBuffer,
        {
          access: 'public',
          addRandomSuffix: false,
          contentType: 'image/jpeg'
        }
      );
      enhancedUrl = enhancedBlob.url;
    }

    // Create menu record in Supabase
    const { data: menu, error: menuError } = await supabase
      .from('menus')
      .insert({
        id: fileId,
        restaurant_id: restaurantId,
        source_type: file.type.startsWith('image/') ? 'image' : 'pdf',
        source_url: originalBlob.url,
        extracted_data: {
          status: 'pending',
          thumbnailUrl,
          enhancedUrl,
          originalName: file.name,
          fileSize: file.size,
          uploadedAt: new Date().toISOString()
        },
        is_active: false // Will be activated after successful extraction
      })
      .select()
      .single();

    if (menuError) {
      console.error('Database error:', menuError);
      return NextResponse.json(
        { error: 'Failed to save menu record' },
        { status: 500 }
      );
    }

    // Return success response
    return NextResponse.json({
      success: true,
      menu: {
        id: menu.id,
        restaurantId: menu.restaurant_id,
        blobUrl: originalBlob.url,
        thumbnailUrl,
        enhancedUrl,
        fileType: file.type,
        fileName: file.name,
        fileSize: file.size
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check upload status
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const menuId = searchParams.get('menuId');

    if (!menuId) {
      return NextResponse.json(
        { error: 'Menu ID is required' },
        { status: 400 }
      );
    }

    const { data: menu, error } = await supabase
      .from('menus')
      .select('*')
      .eq('id', menuId)
      .single();

    if (error || !menu) {
      return NextResponse.json(
        { error: 'Menu not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      menu,
      extractionStatus: menu.extracted_data?.status || 'pending'
    });

  } catch (error) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: 'Failed to check status' },
      { status: 500 }
    );
  }
}