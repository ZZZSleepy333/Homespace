import { NextResponse } from "next/server";

import getCurrentUser from "@/app/actions/getCurrentUser";
import prisma from "@/app/libs/prismadb";

interface IParams {
  listingId?: string;
}

export async function DELETE(
  request: Request,
  { params }: { params: IParams }
) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
  }

  const { listingId } = params;

  if (!listingId || typeof listingId !== "string") {
    throw new Error("Invalid ID");
  }

  const listing = await prisma.listing.deleteMany({
    where: {
      id: listingId,
      userId: currentUser.id,
    },
  });

  return NextResponse.json(listing);
}

export async function GET(request: Request, { params }: { params: IParams }) {
  const { listingId } = params;

  if (!listingId || typeof listingId !== "string") {
    throw new Error("Invalid ID");
  }

  const listing = await prisma.listing.findUnique({
    where: {
      id: listingId,
    },
  });

  if (!listing) {
    return NextResponse.error();
  }

  return NextResponse.json(listing);
}

export async function PUT(request: Request, { params }: { params: IParams }) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { listingId } = params;
    const body = await request.json();
    const {
      title,
      description,
      imageSrc,
      category,
      roomCount,
      bathroomCount,
      guestCount,
      location,
      price,
      amenities,
    } = body;

    if (!listingId || typeof listingId !== "string") {
      return NextResponse.json(
        { error: "Invalid ID" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!title || !description || !category || !roomCount || 
        !bathroomCount || !guestCount || !location || !price) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Ensure imageSrc is an array of strings
    if (!Array.isArray(imageSrc) || !imageSrc.every(url => typeof url === 'string')) {
      return NextResponse.json(
        { error: "imageSrc must be an array of strings" },
        { status: 400 }
      );
    }

    // Validate imageSrc array length
    if (imageSrc.length === 0) {
      return NextResponse.json(
        { error: "At least one image is required" },
        { status: 400 }
      );
    }

    if (imageSrc.length > 10) {
      return NextResponse.json(
        { error: "Maximum 10 images allowed" },
        { status: 400 }
      );
    }

    // Check if the listing exists and belongs to the current user
    const existingListing = await prisma.listing.findFirst({
      where: {
        id: listingId,
        userId: currentUser.id,
      },
    });

    if (!existingListing) {
      return NextResponse.json(
        { error: "Listing not found or unauthorized" },
        { status: 404 }
      );
    }

    const updatedListing = await prisma.listing.update({
      where: {
        id: listingId,
      },
      data: {
        title,
        description,
        imageSrc: imageSrc as string[],
        category,
        roomCount,
        bathroomCount,
        guestCount,
        locationValue: location,
        price: parseInt(price, 10),
        amenities: amenities || [],
      },
    });

    return NextResponse.json(updatedListing);
  } catch (error) {
    console.error('Error updating listing:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
