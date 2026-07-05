import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  const ownerToken = req.nextUrl.searchParams.get('ownerToken');

  const company = await prisma.company.findUnique({
    where: { slug: params.slug },
    include: { products: { include: { variants: true }, orderBy: { createdAt: 'desc' } } },
  });

  if (!company) {
    return NextResponse.json({ error: 'Showroom not found' }, { status: 404 });
  }

  const isOwner = ownerToken && ownerToken === company.ownerToken;

  // PRIVATE showrooms 404 for anyone without the owner token — same rule
  // as the full platform: no "locked preview", it simply isn't reachable.
  if (company.visibility === 'PRIVATE' && !isOwner) {
    return NextResponse.json({ error: 'Showroom not found' }, { status: 404 });
  }

  // Never leak the owner token to non-owners
  const { ownerToken: _omit, ...safeCompany } = company;
  return NextResponse.json({ ...safeCompany, isOwner: Boolean(isOwner) });
}
