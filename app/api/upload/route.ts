import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { NextResponse } from 'next/server';

export async function POST(request: Request): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname) => ({
        allowedContentTypes: ['video/mp4', 'video/quicktime', 'video/x-m4v', 'audio/mpeg', 'audio/mp4'],
        addRandomSuffix: true,
        tokenPayload: JSON.stringify({ pathname, source: 'opus-creative-desk' }),
      }),
      onUploadCompleted: async ({ blob }) => {
        console.log('OPUS_UPLOAD_COMPLETE', blob.pathname, blob.url);
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 400 },
    );
  }
}
