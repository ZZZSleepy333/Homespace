import { NextResponse } from "next/server";

import prisma from "@/app/libs/prismadb";
import getCurrentUser from "@/app/actions/getCurrentUser";

export async function POST(request: Request) {
  try {
    const currentUser = await getCurrentUser();

    if (!currentUser) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

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

    const listing = await prisma.listing.create({
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
        userId: currentUser.id,
        amenities: amenities || [],
      },
    });

    return NextResponse.json(listing);
  } catch (error) {
    console.error('Error creating listing:', error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
