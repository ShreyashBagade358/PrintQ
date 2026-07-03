import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("Seeding database...")

  const hashedPassword = await bcrypt.hash("password123", 12)

  // Create shop owner
  const owner = await prisma.user.upsert({
    where: { email: "owner@printq.test" },
    update: {},
    create: {
      name: "Shop Owner",
      email: "owner@printq.test",
      password: hashedPassword,
      role: "SHOP_OWNER",
      emailVerified: new Date(),
    },
  })
  console.log(`Created owner: ${owner.email}`)

  // Create shop
  const shop = await prisma.shop.upsert({
    where: { slug: "test-print-shop" },
    update: {},
    create: {
      name: "Test Print Shop",
      slug: "test-print-shop",
      address: "123 Main Street",
      city: "Mumbai",
      state: "Maharashtra",
      pinCode: "400001",
      phone: "9876543210",
      email: "owner@printq.test",
      ownerId: owner.id,
      status: "ACTIVE",
    },
  })
  console.log(`Created shop: ${shop.name} (${shop.slug})`)

  // Create customer user
  const customer = await prisma.user.upsert({
    where: { email: "customer@test.com" },
    update: {},
    create: {
      name: "Test Customer",
      email: "customer@test.com",
      password: hashedPassword,
      role: "CUSTOMER",
      emailVerified: new Date(),
    },
  })
  console.log(`Created customer: ${customer.email}`)

  // Create customer record in the shop
  const customerRecord = await prisma.customer.upsert({
    where: { email_shopId: { email: "customer@test.com", shopId: shop.id } },
    update: {},
    create: {
      name: "Test Customer",
      email: "customer@test.com",
      phone: "9876543211",
      shopId: shop.id,
      userId: customer.id,
    },
  })
  console.log(`Created customer record: ${customerRecord.name}`)

  const secondCustomer = await prisma.customer.upsert({
    where: { email_shopId: { email: "rahul@example.com", shopId: shop.id } },
    update: {},
    create: {
      name: "Rahul S.",
      email: "rahul@example.com",
      phone: "9876543212",
      shopId: shop.id,
    },
  })
  console.log(`Created customer: ${secondCustomer.name}`)

  // Create printers
  const printers = [
    { name: "HP LaserJet Pro M404", model: "M404dn", paperSize: ["A4", "A3"], colorCapable: false, duplexCapable: true, paperLevel: 85, inkLevel: 60 },
    { name: "Canon imageRUNNER 2206", model: "iR2206", paperSize: ["A4", "A3", "A5"], colorCapable: true, duplexCapable: true, paperLevel: 45, inkLevel: 80 },
    { name: "Epson WorkForce Pro", model: "WF-C878R", paperSize: ["A4", "Letter"], colorCapable: true, duplexCapable: true, paperLevel: 90, inkLevel: 40 },
  ]

  for (const p of printers) {
    const existing = await prisma.printer.findFirst({
      where: { name: p.name, shopId: shop.id },
    })
    if (!existing) {
      await prisma.printer.create({
        data: { ...p, shopId: shop.id, status: "ONLINE" },
      })
      console.log(`Created printer: ${p.name}`)
    } else {
      console.log(`Printer already exists: ${p.name}`)
    }
  }

  // Create pricing rules
  const pricingRules = [
    { paperSize: "A4", colorType: "Black & White", pricePerPage: 2 },
    { paperSize: "A4", colorType: "Color", pricePerPage: 10 },
    { paperSize: "A3", colorType: "Black & White", pricePerPage: 4 },
    { paperSize: "A3", colorType: "Color", pricePerPage: 20 },
  ]

  for (const rule of pricingRules) {
    await prisma.pricingRule.upsert({
      where: { shopId_paperSize_colorType: { shopId: shop.id, paperSize: rule.paperSize, colorType: rule.colorType } },
      update: {},
      create: { ...rule, shopId: shop.id, isActive: true },
    })
  }
  console.log("Created pricing rules")

  // Create a test order
  const testOrder = await prisma.order.upsert({
    where: { orderId: "ORD-TEST001" },
    update: {},
    create: {
      orderId: "ORD-TEST001",
      pages: 25,
      copies: 2,
      color: "Black & White",
      paperSize: "A4",
      sides: "Single Sided",
      finishing: "Stapled",
      amount: 100,
      discount: 0,
      total: 100,
      notes: "Please print on good quality paper",
      status: "RECEIVED",
      customerId: customerRecord.id,
      userId: owner.id,
      shopId: shop.id,
      files: {
        create: {
          name: "test-document.pdf",
          url: "https://example.com/test.pdf",
          size: 1024000,
          type: "application/pdf",
          pages: 25,
        },
      },
    },
  })
  console.log(`Created test order: ${testOrder.orderId}`)

  // Create queue item for the test order
  const existingQueue = await prisma.queueItem.findFirst({
    where: { orderId: testOrder.id },
  })
  if (!existingQueue) {
    await prisma.queueItem.create({
      data: {
        position: 1,
        status: "QUEUED",
        priority: "NORMAL",
        shopId: shop.id,
        orderId: testOrder.id,
      },
    })
    console.log("Created queue item for test order")
  }

  // Create a second test order with more pages (completed)
  const completedOrder = await prisma.order.upsert({
    where: { orderId: "ORD-TEST002" },
    update: {},
    create: {
      orderId: "ORD-TEST002",
      pages: 50,
      copies: 1,
      color: "Color",
      paperSize: "A4",
      sides: "Single Sided",
      finishing: "None",
      amount: 500,
      discount: 0,
      total: 500,
      status: "COMPLETED",
      completedAt: new Date(),
      customerId: secondCustomer.id,
      userId: owner.id,
      shopId: shop.id,
      files: {
        create: {
          name: "brochure-final.pdf",
          url: "https://example.com/brochure.pdf",
          size: 5120000,
          type: "application/pdf",
          pages: 50,
        },
      },
    },
  })
  console.log(`Created completed order: ${completedOrder.orderId}`)

  // Update customer stats
  await prisma.customer.update({
    where: { id: customerRecord.id },
    data: { totalOrders: { increment: 1 }, totalSpent: { increment: 100 } },
  })
  await prisma.customer.update({
    where: { id: secondCustomer.id },
    data: { totalOrders: { increment: 1 }, totalSpent: { increment: 500 } },
  })

  console.log("")
  console.log("✅ Seeding complete!")
  console.log("")
  console.log("Login credentials:")
  console.log("  Owner:  owner@printq.test / password123")
  console.log("  Customer: customer@test.com / password123")
}

main()
  .catch((e) => {
    console.error("Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
