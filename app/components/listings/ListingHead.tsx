"use client";

import { useRouter } from "next/navigation";
import { useCallback, useState } from "react";
import axios from "axios";
import { toast } from "react-hot-toast";
import Image from "next/image";

import useCountries from "@/app/hooks/useCountries";
import { SafeUser } from "@/app/types";

import Heading from "../Heading";
import HeartButton from "../HeartButton";
import Container from "@/app/components/Container";
import { categories } from "../navbar/Categories";

interface ListingHeadProps {
  title: string;
  locationValue: string;
  imageSrc: string[];
  id: string;
  currentUser?: SafeUser | null;
}

const ListingHead: React.FC<ListingHeadProps> = ({
  title,
  locationValue,
  imageSrc,
  id,
  currentUser,
}) => {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const { getByValue } = useCountries();
  const location = getByValue(locationValue);

  const category = categories.find((items: any) => items.label === locationValue);

  const onDelete = useCallback(() => {
    setIsLoading(true);

    axios
      .delete(`/api/listings/${id}`)
      .then(() => {
        toast.success("Listing deleted");
        router.refresh();
        router.push("/");
      })
      .catch(() => {
        toast.error("Something went wrong.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [router, id]);

  return (
    <>
      
        <div className="w-full h-full">
          <div className="flex flex-col gap-6">
            <div className="flex flex-row justify-between items-center"> 
              <Heading title={title} subtitle={`${locationValue}`} />
              <div className="  top-5 right-5">
              <HeartButton listingId={id} currentUser={currentUser} />
              </div>
            </div>
          
            <div className="w-full h-[60vh] overflow-x-auto">
              <div className="flex h-full">
                {imageSrc.map((src, index) => (
                  <div key={index} className="relative min-w-full h-full">
                    <Image
                      src={src}
                      fill
                      className="object-cover"
                      alt={`Image ${index + 1}`}
                    />
                     
                      
                    
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
    
    </>
  );
};

export default ListingHead;
