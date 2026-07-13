import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { randomUUID } from 'crypto';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const ownerToken = formData.get('ownerToken');

    if (typeof ownerToken !== 'string' || !ownerToken) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }
    const company = await prisma.company.findUnique({ where: { ownerToken } });
    if (!company) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

    if (!(file instanceof Blob)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return NextResponse.json({ error: 'Blob storage is not configured (missing BLOB_READ_WRITE_TOKEN)' }, { status: 500 });
    }

    const extension = file.type === 'image/png' ? 'png' : 'jpg';
    const blob = await put(`${company.slug}/${randomUUID()}.${extension}`, file, {
      access: 'public',
      contentType: file.type || 'image/jpeg',
    });

    return NextResponse.json({ url: blob.url });
  } catch (err: any) {
    return NextResponse.json({ error: err.message ?? 'Upload failed' }, { status: 500 });
  }
}
