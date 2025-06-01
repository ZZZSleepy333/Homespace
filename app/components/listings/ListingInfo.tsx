"use client";

import dynamic from "next/dynamic";
import { IconType } from "react-icons";

import useCountries from "@/app/hooks/useCountries";
import { SafeUser } from "@/app/types";

import Avatar from "../Avatar";
import ListingCategory from "./ListingCategory";

const Map = dynamic(() => import("../Map"), {
  ssr: false,
});

interface ListingInfoProps {
  user: SafeUser;
  description: string;
  guestCount: number;
  roomCount: number;
  bathroomCount: number;
  category:
    | {
        icon: IconType;
        label: string;
        description: string;
      }
    | undefined;
  locationValue: string;
  exactLocation?: string;
  amenities?: string[];
}

const ListingInfo: React.FC<ListingInfoProps> = ({
  user,
  description,
  guestCount,
  roomCount,
  bathroomCount,
  category,
  locationValue,
  exactLocation,
  amenities,
}) => {
  const { getByValue } = useCountries();

  const coordinates = getByValue(locationValue)?.latlng;

  return (
    <div className="col-span-4 flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <div
          className="
            text-xl 
            font-semibold 
            flex 
            flex-row 
            items-center
            gap-2
          "
        >
          <div>Hosted by {user?.name}</div>
          <Avatar src={user?.image} />
        </div>
        <div
          className="
            flex 
            flex-row 
            items-center 
            gap-4 
            font-light
            text-neutral-500
          "
        >
          <div>{guestCount} guests</div>
          <div>{roomCount} rooms</div>
          <div>{bathroomCount} bathrooms</div>
        </div>
      </div>
      <hr />
      {category && (
        <ListingCategory
          icon={category.icon}
          label={category?.label}
          description={category?.description}
        />
      )}
      <hr />
      <div
        className="
      text-lg font-light text-neutral-500"
      >
        {description}
      </div>
      <hr />
      {amenities && amenities.length > 0 && (
        <>
          <div className="flex flex-col gap-2">
            <div className="text-xl font-semibold">Amenities</div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
              {amenities.map((amenity) => (
                <div
                  key={amenity}
                  className="flex items-center gap-2 p-2 rounded-md bg-neutral-100"
                >
                  <div className="font-medium">{amenity}</div>
                </div>
              ))}
            </div>
          </div>
          <hr />
        </>
      )}
      <div className="flex flex-col gap-2">
        <div className="text-xl font-semibold">Location</div>
        {exactLocation && (
          <div className="text-lg font-light text-neutral-500 mb-2">
            {exactLocation}
          </div>
        )}
        <Map center={coordinates} />
      </div>
    </div>
  );
};

export default ListingInfo;
