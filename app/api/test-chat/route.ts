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

    const participantIds = [currentUser.id, hostId].sort();

    let conversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participantIds: { has: currentUser.id } },
          { participantIds: { has: hostId } },
        ],
      },
    });

    if (conversation && conversation.participantIds.length !== 2) {
      conversation = null;
    }

    if (!conversation) {
      conversation = await prisma.conversation.create({
        data: {
          participantIds: participantIds,
          lastMessageAt: new Date(),
          reservationId: reservationId,
        },
      });
    }

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
