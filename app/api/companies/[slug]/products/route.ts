import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(
  req: NextRequest,
  { params }: { params: { slug: string } },
) {
  const body = await req.json();
  const { ownerToken, name, masterRef, moqLabel, packingLabel, priceMode, priceValue, isExclusive, variants } = body;

  const company = await prisma.company.findUnique({ where: { slug: params.slug } });
  if (!company) {
    return NextResponse.json({ error: 'Showroom not found' }, { status: 404 });
  }
  if (ownerToken !== company.ownerToken) {
    return NextResponse.json({ error: 'Not authorized to edit this showroom' }, { status: 403 });
  }
  if (!name) {
    return NextResponse.json({ error: 'Product name is required' }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      companyId: company.id,
      name,
      masterRef,
      moqLabel,
      packingLabel,
      priceMode: priceMode ?? 'quote',
      priceValue: priceValue ? Number(priceValue) : undefined,
      isExclusive: Boolean(isExclusive),
      variants: {
        create: (variants ?? []).map((v: { type: string; label: string; colorHex?: string; photoUrl?: string }) => ({
          type: v.type,
          label: v.label,
          colorHex: v.colorHex,
          photoUrl: v.photoUrl,
        })),
      },
    },
    include: { variants: true },
  });

  return NextResponse.json(product);
}
