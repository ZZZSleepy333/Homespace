import { PrismaClient } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

const SEED_FLAG_KEY = "SEED_COMPLETED";

async function main() {
  const existingSeedFlag = await prisma.user.findFirst({
    where: {
      email: "seed@flag.internal",
    },
  });

  if (existingSeedFlag) {
    console.log("Seed data has already been created. Skipping...");
    return;
  }

  console.log("Creating seed data...");

  await prisma.user.create({
    data: {
      email: "seed@flag.internal",
      name: "SEED_FLAG",
      hashedPassword: await bcrypt.hash("unused", 12),
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const hashedPassword = await bcrypt.hash("password123", 12);

  const user1 = await prisma.user.create({
    data: {
      email: "alice@example.com",
      name: "Alice Johnson",
      hashedPassword,
      image:
        "https://images.unsplash.com/photo-1494790108755-2616b612b566?w=150&h=150&fit=crop&crop=face",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const user2 = await prisma.user.create({
    data: {
      email: "bob@example.com",
      name: "Bob Smith",
      hashedPassword,
      image:
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const user3 = await prisma.user.create({
    data: {
      email: "charlie@example.com",
      name: "Charlie Brown",
      hashedPassword,
      image:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const user4 = await prisma.user.create({
    data: {
      email: "diana@example.com",
      name: "Diana Prince",
      hashedPassword,
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  });

  const listing1 = await prisma.listing.create({
    data: {
      title: "Cozy Downtown Apartment",
      description:
        "A beautiful and modern apartment in the heart of the city. Perfect for couples or solo travelers. Walking distance to restaurants, cafes, and public transportation.",
      imageSrc: [
        "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop",
      ],
      category: "Apartment",
      roomCount: 2,
      bathroomCount: 1,
      guestCount: 4,
      locationValue: "New York, NY",
      price: 150,
      amenities: ["WiFi", "Kitchen", "Air Conditioning", "Heating"],
      userId: user1.id,
      createdAt: new Date(),
    },
  });

  const listing2 = await prisma.listing.create({
    data: {
      title: "Luxury Beach House",
      description:
        "Stunning beachfront property with panoramic ocean views. Private beach access, spacious deck, and modern amenities. Perfect for families and groups.",
      imageSrc: [
        "https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800&h=600&fit=crop",
      ],
      category: "Beach",
      roomCount: 4,
      bathroomCount: 3,
      guestCount: 8,
      locationValue: "Malibu, CA",
      price: 450,
      amenities: ["WiFi", "Kitchen", "Pool", "Beach Access", "Parking"],
      userId: user2.id,
      createdAt: new Date(),
    },
  });

  const listing3 = await prisma.listing.create({
    data: {
      title: "Mountain Cabin Retreat",
      description:
        "Peaceful mountain cabin surrounded by nature. Perfect for hiking enthusiasts and those seeking tranquility. Fireplace, hot tub, and stunning mountain views.",
      imageSrc: [
        "https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&h=600&fit=crop",
        "https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800&h=600&fit=crop",
      ],
      category: "Cabin",
      roomCount: 3,
      bathroomCount: 2,
      guestCount: 6,
      locationValue: "Aspen, CO",
      price: 275,
      amenities: ["WiFi", "Kitchen", "Fireplace", "Hot Tub", "Hiking Trails"],
      userId: user3.id,
      createdAt: new Date(),
    },
  });

  const reservation1 = await prisma.reservation.create({
    data: {
      userId: user3.id,
      listingId: listing1.id,
      startDate: new Date("2024-07-15"),
      endDate: new Date("2024-07-18"),
      totalPrice: 450,
      createdAt: new Date(),
    },
  });

  const reservation2 = await prisma.reservation.create({
    data: {
      userId: user4.id,
      listingId: listing2.id,
      startDate: new Date("2024-08-01"),
      endDate: new Date("2024-08-05"),
      totalPrice: 1800,
      createdAt: new Date(),
    },
  });

  const conversation1 = await prisma.conversation.create({
    data: {
      participantIds: [user1.id, user3.id],
      reservationId: reservation1.id,
      lastMessageAt: new Date(),
      createdAt: new Date(),
    },
  });

  const conversation2 = await prisma.conversation.create({
    data: {
      participantIds: [user2.id, user4.id],
      reservationId: reservation2.id,
      lastMessageAt: new Date(),
      createdAt: new Date(),
    },
  });

  await prisma.message.create({
    data: {
      content:
        'Hi! I just completed my booking for "Cozy Downtown Apartment". Looking forward to my stay! 🏠✨',
      senderId: user3.id,
      userId: user3.id,
      conversationId: conversation1.id,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
  });

  await prisma.message.create({
    data: {
      content:
        "Welcome! I'm so excited to host you. The apartment is all ready for your arrival. Let me know if you have any questions!",
      senderId: user1.id,
      userId: user1.id,
      conversationId: conversation1.id,
      createdAt: new Date(Date.now() - 1.5 * 60 * 60 * 1000), // 1.5 hours ago
    },
  });

  await prisma.message.create({
    data: {
      content:
        "Thank you! Quick question - what's the best way to get from the airport to your place?",
      senderId: user3.id,
      userId: user3.id,
      conversationId: conversation1.id,
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
    },
  });

  await prisma.message.create({
    data: {
      content:
        'Hi! I just completed my booking for "Luxury Beach House". Looking forward to my stay! 🏠✨',
      senderId: user4.id,
      userId: user4.id,
      conversationId: conversation2.id,
      createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
    },
  });

  await prisma.message.create({
    data: {
      content:
        "Hello! Thanks for booking. The house is ready and the weather looks perfect for your beach getaway!",
      senderId: user2.id,
      userId: user2.id,
      conversationId: conversation2.id,
      createdAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000), // 2.5 hours ago
    },
  });

  // Update conversation lastMessageAt
  await prisma.conversation.update({
    where: { id: conversation1.id },
    data: { lastMessageAt: new Date(Date.now() - 1 * 60 * 60 * 1000) },
  });

  await prisma.conversation.update({
    where: { id: conversation2.id },
    data: { lastMessageAt: new Date(Date.now() - 2.5 * 60 * 60 * 1000) },
  });

  console.log("✅ Seed data created successfully!");
  console.log("\n📧 Sample user credentials:");
  console.log("Email: alice@example.com | Password: password123");
  console.log("Email: bob@example.com | Password: password123");
  console.log("Email: charlie@example.com | Password: password123");
  console.log("Email: diana@example.com | Password: password123");
  console.log(
    "\n🏠 Created 3 sample listings with reservations and conversations"
  );
}

main()
  .catch((e) => {
    console.error("❌ Error creating seed data:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
