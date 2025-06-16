import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { hostId, listingTitle, reservationId } = body;

    if (!hostId || !listingTitle) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Test creating a conversation and sending an automatic message
    const participantIds = [currentUser.id, hostId].sort();

    // Check if conversation already exists
    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participantIds: { has: currentUser.id } },
          { participantIds: { has: hostId } },
        ],
      },
    });

    // Đảm bảo chỉ lấy conversation có đúng 2 participant
    if (conversation && conversation.participantIds.length !== 2) {
      conversation = null;
    }

    // Create new conversation if it doesn't exist
    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participantIds: participantIds,
          lastMessageAt: new Date(),
          reservationId: reservationId,
        },
      });
    }

    // Create automatic welcome message
    const automaticMessage = `Hi! I just completed my booking for "${listingTitle}". Looking forward to my stay! 🏠✨`;

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participantIds: participantIds,
          lastMessageAt: new Date(),
          reservationId: reservationId,
        },
      });
    }

    const message = await prisma.message.create({
      data: {
        content: automaticMessage,
        senderId: currentUser.id,
        userId: currentUser.id,
        conversationId: conversation.id,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          },
        },
      },
    });

    // Update conversation's last message timestamp
    await prisma.conversation.update({
      where: {
        id: conversation.id,
      },
      data: {
        lastMessageAt: new Date(),
      },
    });

    return NextResponse.json({
      success: true,
      message,
      conversationId: conversation.id,
    });
  } catch (error) {
    console.error("Error testing chat:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
