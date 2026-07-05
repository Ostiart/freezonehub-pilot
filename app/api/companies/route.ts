import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { slugify, generateOwnerToken } from '@/lib/slug';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, category, whatsappNumber, foundedYear, visibility } = body;

  if (!name || !category) {
    return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
  }

  const baseSlug = slugify(name);
  let slug = baseSlug;
  let attempt = 1;
  // Handles two companies with the same name (e.g. two "Royco" entries)
  while (await prisma.company.findUnique({ where: { slug } })) {
    attempt += 1;
    slug = `${baseSlug}-${attempt}`;
  }

  const company = await prisma.company.create({
    data: {
      slug,
      name,
      category,
      whatsappNumber,
      foundedYear: foundedYear ? Number(foundedYear) : undefined,
      visibility: visibility ?? 'PUBLIC',
      ownerToken: generateOwnerToken(),
    },
  });

  return NextResponse.json(company);
}
