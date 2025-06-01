"use client";

import { toast } from "react-hot-toast";
import axios from "axios";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";

import { safeListings, SafeUser } from "@/app/types";

import Heading from "@/app/components/Heading";
import Container from "@/app/components/Container";
import ListingCard from "@/app/components/listings/ListingCard";
import useEditModal from "@/app/hooks/useEditModal";

interface PropertiesClientProps {
  listings: safeListings[];
  currentUser?: SafeUser | null;
}

const PropertiesClient: React.FC<PropertiesClientProps> = ({
  listings,
  currentUser,
}) => {
  const router = useRouter();
  const editModal = useEditModal();
  const [deletingId, setDeletingId] = useState("");

  const onDelete = useCallback(
    (id: string) => {
      setDeletingId(id);

      axios
        .delete(`/api/listings/${id}`)
        .then(() => {
          toast.success("Listing deleted");
          router.refresh();
        })
        .catch((error) => {
          toast.error(error?.response?.data?.error);
        })
        .finally(() => {
          setDeletingId("");
        });
    },
    [router]
  );

  const onEdit = useCallback(
    (id: string) => {
      editModal.onOpen(id);
    },
    [editModal]
  );

  return (
    <Container>
      <Heading title="Properties" subtitle="List of your properties" />
      <div
        className="
          mt-10
          grid 
          grid-cols-1 
          sm:grid-cols-2 
          md:grid-cols-3 
          lg:grid-cols-4
          xl:grid-cols-5
          2xl:grid-cols-6
          gap-8
        "
      >
        {listings.map((listing: any) => (
          <div key={listing.id} className="col-span-1">
            <ListingCard
              data={listing}
              actionId={listing.id}
              onAction={onEdit}
              disabled={false}
              actionLabel="Edit property"
              currentUser={currentUser}
            />
            <div className="mt-2">
              <ListingCard
                data={listing}
                actionId={listing.id}
                onAction={onDelete}
                disabled={deletingId === listing.id}
                actionLabel="Delete property"
                currentUser={currentUser}
                small
              />
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
};

export default PropertiesClient;
