import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { slugify, generateOwnerToken } from '@/lib/slug';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { name, category, whatsappNumber, foundedYear, visibility, businessPhotos, confirmDuplicate } = body;

  if (!name || !category) {
    return NextResponse.json({ error: 'Name and category are required' }, { status: 400 });
  }

  const baseSlug = slugify(name);

  // Warn the admin instead of silently creating a numbered duplicate —
  // onboarding is manual (admin-only), so a similar name is more likely
  // a mistake (re-entering the same company) than a real coincidence.
  const similarCompanies = await prisma.company.findMany({
    where: { OR: [{ slug: baseSlug }, { slug: { startsWith: `${baseSlug}-` } }] },
    select: { name: true, slug: true },
  });

  if (similarCompanies.length > 0 && !confirmDuplicate) {
    return NextResponse.json(
      {
        warning: 'duplicate',
        message: `A company with a similar name already exists: ${similarCompanies.map((c) => c.name).join(', ')}. Confirm to create a new one anyway.`,
        existing: similarCompanies,
      },
      { status: 409 },
    );
  }

  let slug = baseSlug;
  let attempt = 1;
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
      businessPhotos: Array.isArray(businessPhotos) ? businessPhotos.filter((url: string) => url && url.trim()) : [],
      ownerToken: generateOwnerToken(),
    },
  });

  return NextResponse.json(company);
}
