import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function GET(request: Request) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      { message: "An error occurred." },
      { status: 500 }
    );
  }

  try {
    const conversations = await prisma.conversation.findMany({
      where: {
        participantIds: {
          has: currentUser.id,
        },
      },
      include: {
        reservation: {
          include: {
            listing: {
              select: {
                id: true,
                title: true,
                imageSrc: true,
              },
            },
          },
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: "desc",
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
        },
      },
      orderBy: {
        lastMessageAt: "desc",
      },
    });

    const conversationsWithParticipants = await Promise.all(
      conversations.map(async (conversation) => {
        const otherParticipantId = conversation.participantIds.find(
          (id) => id !== currentUser.id
        );

        const otherParticipant = await prisma.user.findUnique({
          where: {
            id: otherParticipantId,
          },
          select: {
            id: true,
            name: true,
            image: true,
          },
        });

        return {
          ...conversation,
          otherParticipant,
          lastMessage: conversation.messages[0] || null,
        };
      })
    );

    return NextResponse.json(conversationsWithParticipants);
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return NextResponse.json(
      { message: "An error occurred." },
      { status: 500 }
    );
  }
}
