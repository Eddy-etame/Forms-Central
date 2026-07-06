import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const fileUrl = searchParams.get('url');

  if (!fileUrl) {
    return new NextResponse('Missing URL', { status: 400 });
  }

  try {
    // We only want to proxy our own supabase storage URLs for security
    if (!fileUrl.includes('supabase.co/storage')) {
      return new NextResponse('Invalid URL', { status: 403 });
    }

    const response = await fetch(fileUrl);
    
    if (!response.ok) {
      return new NextResponse('File not found', { status: 404 });
    }

    const blob = await response.blob();
    const contentType = response.headers.get('content-type') || 'application/octet-stream';
    
    // Extract filename from URL or generate a default one
    const urlParts = fileUrl.split('/');
    const filename = urlParts[urlParts.length - 1] || 'download_file';

    // Force download by setting Content-Disposition to attachment
    return new NextResponse(blob, {
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Download Proxy Error:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
