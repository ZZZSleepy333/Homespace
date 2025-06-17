import { NextResponse } from "next/server";
import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

interface IParams {
  notificationId?: string;
}

export async function PATCH(request: Request, { params }: { params: IParams }) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      { message: "An error occurred." },
      { status: 500 }
    );
  }

  const { notificationId } = params;

  if (!notificationId || typeof notificationId !== "string") {
    throw new Error("Invalid notification ID");
  }

  try {
    const body = await request.json();
    const { read } = body;

    const existingNotification = await prisma.notification.findUnique({
      where: {
        id: notificationId,
      },
    });

    if (
      !existingNotification ||
      existingNotification.userId !== currentUser.id
    ) {
      return NextResponse.json(
        { message: "An error occurred." },
        { status: 500 }
      );
    }

    const notification = await prisma.notification.update({
      where: {
        id: notificationId,
      },
      data: {
        read: read,
      },
    });

    return NextResponse.json(notification);
  } catch (error) {
    console.error("Error updating notification:", error);
    return NextResponse.json(
      { message: "An error occurred." },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: IParams }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.json(
      { message: "An error occurred." },
      { status: 500 }
    );
  }

  const { notificationId } = params;

  if (!notificationId || typeof notificationId !== "string") {
    throw new Error("Invalid notification ID");
  }

  try {
    const existingNotification = await prisma.notification.findUnique({
      where: {
        id: notificationId,
      },
    });

    if (
      !existingNotification ||
      existingNotification.userId !== currentUser.id
    ) {
      return NextResponse.json(
        { message: "An error occurred." },
        { status: 500 }
      );
    }

    await prisma.notification.delete({
      where: {
        id: notificationId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting notification:", error);
    return NextResponse.json(
      { message: "An error occurred." },
      { status: 500 }
    );
  }
}
