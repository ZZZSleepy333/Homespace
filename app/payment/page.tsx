import getCurrentUser from "@/app/actions/getCurrentUser";
import getListingById from "@/app/actions/getListingById";

import ClientOnly from "@/app/components/ClientOnly";
import EmptyState from "@/app/components/EmptyState";

import PaymentClient from "./PaymentClient";

interface PaymentPageProps {
  searchParams: {
    listingId?: string;
    startDate?: string;
    endDate?: string;
    totalPrice?: string;
  };
}

const PaymentPage = async ({ searchParams }: PaymentPageProps) => {
  const { listingId, startDate, endDate, totalPrice } = searchParams;

  if (!listingId || !startDate || !endDate || !totalPrice) {
    return (
      <ClientOnly>
        <EmptyState
          title="Invalid booking information"
          subtitle="Please return to the listing and try again."
        />
      </ClientOnly>
    );
  }

  const listing = await getListingById({ listingId });
  const currentUser = await getCurrentUser();

  if (!listing) {
    return (
      <ClientOnly>
        <EmptyState
          title="Listing not found"
          subtitle="The listing you're trying to book could not be found."
        />
      </ClientOnly>
    );
  }

  if (!currentUser) {
    return (
      <ClientOnly>
        <EmptyState
          title="Please log in"
          subtitle="You need to be logged in to make a booking."
        />
      </ClientOnly>
    );
  }

  return (
    <ClientOnly>
      <PaymentClient
        listing={listing}
        currentUser={currentUser}
        reservationData={{
          startDate,
          endDate,
          totalPrice: parseFloat(totalPrice),
        }}
      />
    </ClientOnly>
  );
};

export default PaymentPage;

