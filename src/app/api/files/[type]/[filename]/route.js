import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import prisma from '@/lib/db';
import { getUploadDir } from '@/lib/uploadDir';

const CONTENT_TYPES = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.pdf': 'application/pdf',
};

export async function GET(request, { params }) {
  try {
    const { type, filename } = await params;

    if (type !== 'profile' && type !== 'passport') {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    // filename is fully controlled server-side (userId-timestamp.ext) but
    // guard against path traversal from a crafted request anyway.
    if (filename.includes('..') || filename.includes('/')) {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }

    const relativePath = `${type}/${filename}`;

    if (type === 'passport') {
      const { searchParams } = new URL(request.url);
      const requesterId = searchParams.get('requesterId');
      if (!requesterId) {
        return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
      }
      const requester = await prisma.user.findUnique({ where: { id: parseInt(requesterId) } });
      const owner = await prisma.user.findFirst({ where: { passportDocument: relativePath } });
      const isOwner = requester && owner && requester.id === owner.id;
      const isAdmin = requester && requester.role === 'ADMIN';
      if (!requester || (!isOwner && !isAdmin)) {
        return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
      }
    }

    const filePath = path.join(getUploadDir(), relativePath);
    const buffer = await readFile(filePath);
    const ext = path.extname(filename).toLowerCase();

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': CONTENT_TYPES[ext] || 'application/octet-stream',
        'Cache-Control': type === 'profile' ? 'public, max-age=3600' : 'private, no-store',
      },
    });
  } catch (error) {
    if (error.code === 'ENOENT') {
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
    }
    console.error('GET file error: ', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
