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
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    return NextResponse.error();
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
    exactLocation,
    price,
    amenities,
  } = body;

  if (!listingId || typeof listingId !== "string") {
    throw new Error("Invalid ID");
  }

  // Check if the listing exists and belongs to the current user
  const existingListing = await prisma.listing.findFirst({
    where: {
      id: listingId,
      userId: currentUser.id,
    },
  });

  if (!existingListing) {
    return NextResponse.error();
  }

  const updatedListing = await prisma.listing.update({
    where: {
      id: listingId,
    },
    data: {
      title,
      description,
      imageSrc,
      category,
      roomCount,
      bathroomCount,
      guestCount,
      locationValue: location.value,
      exactLocation,
      price,
      amenities: amenities || [],
    },
  });

  return NextResponse.json(updatedListing);
}
