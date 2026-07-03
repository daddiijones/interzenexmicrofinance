import { NextResponse } from 'next/server';
import { mkdir, writeFile } from 'fs/promises';
import path from 'path';
import prisma from '@/lib/db';
import { getUploadDir } from '@/lib/uploadDir';

const MAX_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = {
  profile: ['image/jpeg', 'image/png', 'image/webp'],
  passport: ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
};

function sanitizeFilename(name) {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(-80);
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const userId = formData.get('userId');
    const type = formData.get('type');

    if (!file || !userId || !type) {
      return NextResponse.json({ success: false, error: 'file, userId, and type are required.' }, { status: 400 });
    }
    if (type !== 'profile' && type !== 'passport') {
      return NextResponse.json({ success: false, error: 'Invalid upload type.' }, { status: 400 });
    }
    if (!ALLOWED_TYPES[type].includes(file.type)) {
      return NextResponse.json({ success: false, error: `Unsupported file type for ${type}: ${file.type}` }, { status: 400 });
    }
    if (file.size > MAX_SIZE_BYTES) {
      return NextResponse.json({ success: false, error: 'File must be under 5MB.' }, { status: 400 });
    }

    const uId = parseInt(userId);
    const user = await prisma.user.findUnique({ where: { id: uId } });
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found.' }, { status: 404 });
    }

    const uploadDir = getUploadDir();
    const typeDir = path.join(uploadDir, type);
    await mkdir(typeDir, { recursive: true });

    const ext = path.extname(sanitizeFilename(file.name)) || '';
    const filename = `${uId}-${Date.now()}${ext}`;
    const filePath = path.join(typeDir, filename);
    const buffer = Buffer.from(await file.arrayBuffer());
    await writeFile(filePath, buffer);

    const relativePath = `${type}/${filename}`;
    const field = type === 'profile' ? 'profilePhoto' : 'passportDocument';
    await prisma.user.update({
      where: { id: uId },
      data: { [field]: relativePath },
    });

    return NextResponse.json({ success: true, path: relativePath });
  } catch (error) {
    console.error('POST upload error: ', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
