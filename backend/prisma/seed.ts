import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main(): Promise<void> {
  console.log('🌱 Seeding FuelLink AI database...');

  // Demo tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo' },
    update: {},
    create: {
      name: 'Demo Corporation',
      slug: 'demo',
      industry: 'Energy',
      country: 'NG',
      timezone: 'Africa/Lagos',
      currency: 'USD',
    },
  });

  // Demo user
  const passwordHash = await bcrypt.hash('DemoPass123!', 12);
  const user = await prisma.user.upsert({
    where: { email: 'admin@demo.fuellink.ai' },
    update: {},
    create: {
      tenantId: tenant.id,
      email: 'admin@demo.fuellink.ai',
      passwordHash,
      firstName: 'Demo',
      lastName: 'Admin',
      emailVerified: true,
    },
  });

  // Demo organisation
  const organisation = await prisma.organisation.upsert({
    where: { id: 'demo-org' },
    update: {},
    create: {
      id: 'demo-org',
      tenantId: tenant.id,
      name: 'Demo Corporation',
      legalName: 'Demo Corporation Ltd',
      type: 'COMPANY',
      industry: 'Energy',
      country: 'NG',
      currency: 'USD',
      verified: true,
      trustScore: 85,
    },
  });

  // Membership
  await prisma.membership.upsert({
    where: { userId_organisationId: { userId: user.id, organisationId: organisation.id } },
    update: {},
    create: {
      userId: user.id,
      organisationId: organisation.id,
      role: 'OWNER',
      isDefault: true,
    },
  });

  // Demo suppliers
  const supplier1 = await prisma.supplier.upsert({
    where: { slug: 'northwind-energy' },
    update: {},
    create: {
      organisationId: organisation.id,
      name: 'Northwind Energy',
      slug: 'northwind-energy',
      description: 'Industrial energy equipment supplier',
      category: 'Energy Equipment',
      country: 'NG',
      rating: 4.5,
      verified: true,
      kybStatus: 'VERIFIED',
      riskScore: 15,
      trustScore: 88,
      certifications: ['ISO 9001', 'ISO 14001'],
      capabilities: ['Manufacturing', 'Distribution', 'Maintenance'],
    },
  });

  const supplier2 = await prisma.supplier.upsert({
    where: { slug: 'atlas-logistics' },
    update: {},
    create: {
      organisationId: organisation.id,
      name: 'Atlas Logistics',
      slug: 'atlas-logistics',
      description: 'Cross-border freight and logistics provider',
      category: 'Logistics',
      country: 'GH',
      rating: 4.2,
      verified: true,
      kybStatus: 'VERIFIED',
      riskScore: 20,
      trustScore: 82,
      certifications: ['ISO 9001'],
      capabilities: ['Freight', 'Customs Clearance', 'Warehousing'],
    },
  });

  // Demo products
  const product1 = await prisma.product.upsert({
    where: { id: 'demo-product-1' },
    update: {},
    create: {
      id: 'demo-product-1',
      organisationId: organisation.id,
      supplierId: supplier1.id,
      name: 'Industrial Diesel Generator 500kVA',
      sku: 'GEN-500',
      description: '500kVA industrial diesel generator',
      category: 'Power Generation',
      unit: 'unit',
      price: 85000,
      currency: 'USD',
      stock: 12,
      minStock: 3,
    },
  });

  const product2 = await prisma.product.upsert({
    where: { id: 'demo-product-2' },
    update: {},
    create: {
      id: 'demo-product-2',
      organisationId: organisation.id,
      supplierId: supplier1.id,
      name: 'Solar Panel 550W',
      sku: 'SOL-550',
      description: 'Monocrystalline solar panel 550W',
      category: 'Renewable Energy',
      unit: 'unit',
      price: 180,
      currency: 'USD',
      stock: 500,
      minStock: 100,
    },
  });

  // Demo warehouse
  const warehouse = await prisma.warehouse.upsert({
    where: { id: 'demo-warehouse' },
    update: {},
    create: {
      id: 'demo-warehouse',
      organisationId: organisation.id,
      name: 'Lagos Main Warehouse',
      code: 'LAG-01',
      address: 'Apapa Port Road',
      city: 'Lagos',
      country: 'NG',
    },
  });

  // Inventory
  await prisma.inventoryItem.upsert({
    where: { warehouseId_productId_batchCode: { warehouseId: warehouse.id, productId: product1.id, batchCode: 'B001' } },
    update: {},
    create: {
      warehouseId: warehouse.id,
      productId: product1.id,
      quantity: 12,
      reservedQty: 0,
      location: 'A-01',
      batchCode: 'B001',
    },
  });

  await prisma.inventoryItem.upsert({
    where: { warehouseId_productId_batchCode: { warehouseId: warehouse.id, productId: product2.id, batchCode: 'B002' } },
    update: {},
    create: {
      warehouseId: warehouse.id,
      productId: product2.id,
      quantity: 500,
      reservedQty: 0,
      location: 'B-02',
      batchCode: 'B002',
    },
  });

  // Demo RFQ
  const rfq = await prisma.rfq.upsert({
    where: { id: 'demo-rfq' },
    update: {},
    create: {
      id: 'demo-rfq',
      organisationId: organisation.id,
      title: 'Supply of 10x Industrial Diesel Generators',
      description: 'Request for quotation for 10 units of 500kVA diesel generators',
      status: 'PUBLISHED',
      currency: 'USD',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      publishedAt: new Date(),
    },
  });

  await prisma.rfqLine.upsert({
    where: { id: 'demo-rfq-line' },
    update: {},
    create: {
      id: 'demo-rfq-line',
      rfqId: rfq.id,
      productId: product1.id,
      description: '500kVA industrial diesel generator',
      quantity: 10,
      unit: 'unit',
      targetPrice: 80000,
    },
  });

  // Demo quote
  const quote = await prisma.quote.upsert({
    where: { id: 'demo-quote' },
    update: {},
    create: {
      id: 'demo-quote',
      rfqId: rfq.id,
      supplierId: supplier1.id,
      organisationId: organisation.id,
      status: 'SUBMITTED',
      currency: 'USD',
      totalAmount: 850000,
      deliveryDays: 45,
      validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.quoteLine.upsert({
    where: { id: 'demo-quote-line' },
    update: {},
    create: {
      id: 'demo-quote-line',
      quoteId: quote.id,
      productId: product1.id,
      description: '500kVA industrial diesel generator',
      quantity: 10,
      unitPrice: 85000,
      total: 850000,
    },
  });

  // Demo wallet
  await prisma.wallet.upsert({
    where: { id: 'demo-wallet' },
    update: {},
    create: {
      id: 'demo-wallet',
      organisationId: organisation.id,
      name: 'Operating Wallet',
      currency: 'USD',
      balance: 500000,
    },
  });

  // Demo lead
  await prisma.lead.upsert({
    where: { id: 'demo-lead' },
    update: {},
    create: {
      id: 'demo-lead',
      organisationId: organisation.id,
      companyName: 'GreenGrid Utilities',
      contactName: 'Amara Okafor',
      email: 'amara@greengrid.example',
      phone: '+2348000000000',
      source: 'Website',
      status: 'QUALIFIED',
      score: 72,
    },
  });

  // Feature flags
  await prisma.featureFlag.upsert({
    where: { tenantId_key: { tenantId: tenant.id, key: 'ai-copilot' } },
    update: {},
    create: { tenantId: tenant.id, key: 'ai-copilot', enabled: true },
  });

  await prisma.featureFlag.upsert({
    where: { tenantId_key: { tenantId: tenant.id, key: 'marketplace' } },
    update: {},
    create: { tenantId: tenant.id, key: 'marketplace', enabled: true },
  });

  console.log('✅ Seed complete.');
  console.log('   Login: admin@demo.fuellink.ai / DemoPass123!');
  console.log('   Tenant: demo');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });