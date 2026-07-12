import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  const body = await req.json();
  const { ownerToken, name, whatsappNumber, paramSlug, photoUrl } = body;

  const company = await prisma.company.findUnique({ where: { slug: params.slug } });
  if (!company) {
    return NextResponse.json({ error: 'Showroom not found' }, { status: 404 });
  }
  if (ownerToken !== company.ownerToken) {
    return NextResponse.json({ error: 'Not authorized to edit this showroom' }, { status: 403 });
  }
  if (!name || !whatsappNumber || !paramSlug) {
    return NextResponse.json({ error: 'Name, WhatsApp number, and link slug are required' }, { status: 400 });
  }

  const cleanParamSlug = paramSlug.toLowerCase().trim().replace(/[^a-z0-9-]/g, '');
  if (!cleanParamSlug) {
    return NextResponse.json({ error: 'Link slug must contain letters or numbers' }, { status: 400 });
  }

  const existing = await prisma.advisor.findUnique({
    where: { companyId_paramSlug: { companyId: company.id, paramSlug: cleanParamSlug } },
  });
  if (existing) {
    return NextResponse.json({ error: 'That link slug is already used by another advisor in this company' }, { status: 409 });
  }

  const advisor = await prisma.advisor.create({
    data: {
      companyId: company.id,
      name,
      whatsappNumber,
      paramSlug: cleanParamSlug,
      photoUrl: photoUrl || undefined,
    },
  });

  return NextResponse.json(advisor);
}
