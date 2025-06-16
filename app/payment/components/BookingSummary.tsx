"use client";

import { format } from "date-fns";
import Image from "next/image";

import { safeListings, SafeUser } from "@/app/types";
import Heading from "@/app/components/Heading";
import { FiMapPin, FiCalendar, FiUsers } from "react-icons/fi";

interface ReservationData {
  startDate: string;
  endDate: string;
  totalPrice: number;
}

interface BookingSummaryProps {
  listing: safeListings & {
    user: SafeUser;
  };
  reservationData: ReservationData;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({
  listing,
  reservationData,
}) => {
  const checkInDate = new Date(reservationData.startDate);
  const checkOutDate = new Date(reservationData.endDate);
  const numberOfNights = Math.ceil(
    (checkOutDate.getTime() - checkInDate.getTime()) / (1000 * 60 * 60 * 24)
  );

  const basePrice = listing.price * numberOfNights;
  const serviceFee = Math.round(basePrice * 0.14); // 14% service fee
  const taxes = Math.round(basePrice * 0.08); // 8% taxes
  const totalPrice = basePrice + serviceFee + taxes;

  return (
    <div className="bg-white rounded-xl border-[1px] border-neutral-200 overflow-hidden sticky top-4">
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="relative w-20 h-20 rounded-lg overflow-hidden">
            <Image
              src={
                Array.isArray(listing.imageSrc)
                  ? listing.imageSrc[0]
                  : listing.imageSrc
              }
              alt={listing.title}
              fill
              className="object-cover"
            />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-lg mb-1 line-clamp-2">
              {listing.title}
            </h3>
            <div className="flex items-center text-sm text-gray-600 mb-2">
              <FiMapPin className="w-4 h-4 mr-1" />
              {listing.locationValue}
            </div>
            <div className="text-sm text-gray-500">
              Hosted by {listing.user.name}
            </div>
          </div>
        </div>
      </div>

      <hr />

      <div className="p-6 space-y-4">
        <Heading title="Your trip" />

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm">
              <FiCalendar className="w-4 h-4 mr-2 text-gray-500" />
              <span className="font-medium">Dates</span>
            </div>
            <div className="text-sm text-right">
              <div>
                {format(checkInDate, "MMM dd")} -{" "}
                {format(checkOutDate, "MMM dd")}
              </div>
              <div className="text-gray-500">
                {numberOfNights} night{numberOfNights > 1 ? "s" : ""}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm">
              <FiUsers className="w-4 h-4 mr-2 text-gray-500" />
              <span className="font-medium">Guests</span>
            </div>
            <div className="text-sm">
              {listing.guestCount} guest{listing.guestCount > 1 ? "s" : ""}
            </div>
          </div>
        </div>
      </div>

      <hr />

      <div className="p-6 space-y-4">
        <Heading title="Price details" />

        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>
              ${listing.price} x {numberOfNights} nights
            </span>
            <span>${basePrice}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Service fee</span>
            <span>${serviceFee}</span>
          </div>

          <div className="flex justify-between text-sm">
            <span>Taxes</span>
            <span>${taxes}</span>
          </div>

          <hr />

          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>${totalPrice}</span>
          </div>
        </div>
      </div>

      <div className="p-6 bg-gray-50">
        <div className="text-xs text-gray-600 space-y-2">
          <p>
            🛡️ Your payment information is protected by 256-bit SSL encryption.
          </p>
          <p>💳 You won&#39;t be charged until your booking is confirmed.</p>
        </div>
      </div>
    </div>
  );
};

export default BookingSummary;
