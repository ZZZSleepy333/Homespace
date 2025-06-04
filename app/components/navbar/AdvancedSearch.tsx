"use client";

import { useSearchParams, useRouter } from 'next/navigation';
import { useMemo, useState, useCallback } from 'react';
import { BiSearch, BiFilterAlt } from 'react-icons/bi';
import { differenceInDays } from 'date-fns';
import { TbBeach, TbMountain, TbPool } from "react-icons/tb";
import {
  GiBarn,
  GiBoatFishing,
  GiCactus,
  GiCastle,
  GiCaveEntrance,
  GiForestCamp,
  GiIsland,
  GiWindmill,
} from "react-icons/gi";
import { FaSkiing } from "react-icons/fa";
import { BsSnow } from "react-icons/bs";
import { IoDiamond } from "react-icons/io5";
import { MdOutlineVilla } from "react-icons/md";

import useSearchModal from '@/app/hooks/useSearchModal';
import useCountries from '@/app/hooks/useCountries';
import Container from '../Container';
import CategoryBox from '../CategoryBox';
import SearchInput from '../inputs/SearchInput';

export const categories = [
  {
    label: "Beach",
    icon: TbBeach,
    description: "This property is close to the beach!",
  },
  {
    label: "Windmills",
    icon: GiWindmill,
    description: "This property is has windmills!",
  },
  {
    label: "Modern",
    icon: MdOutlineVilla,
    description: "This property is modern!",
  },
  {
    label: "Countryside",
    icon: TbMountain,
    description: "This property is in the countryside!",
  },
  {
    label: "Pools",
    icon: TbPool,
    description: "This is property has a beautiful pool!",
  },
  {
    label: "Islands",
    icon: GiIsland,
    description: "This property is on an island!",
  },
  {
    label: "Lake",
    icon: GiBoatFishing,
    description: "This property is near a lake!",
  },
  {
    label: "Skiing",
    icon: FaSkiing,
    description: "This property has skiing activies!",
  },
  {
    label: "Castles",
    icon: GiCastle,
    description: "This property is an ancient castle!",
  },
  {
    label: "Caves",
    icon: GiCaveEntrance,
    description: "This property is in a spooky cave!",
  },
  {
    label: "Camping",
    icon: GiForestCamp,
    description: "This property offers camping activities!",
  },
  {
    label: "Arctic",
    icon: BsSnow,
    description: "This property is in arctic environment!",
  },
  {
    label: "Desert",
    icon: GiCactus,
    description: "This property is in the desert!",
  },
  {
    label: "Barns",
    icon: GiBarn,
    description: "This property is in a barn!",
  },
  {
    label: "Lux",
    icon: IoDiamond,
    description: "This property is brand new and luxurious!",
  },
];

const amenities = [
  "Wifi",
  "TV",
  "Kitchen",
  "Washer",
  "Free parking",
  "Paid parking",
  "Air conditioning",
  "Heating",
  "Dedicated workspace",
  "Pool",
  "Hot tub",
  "Patio",
  "BBQ grill",
  "Gym",
  "Breakfast",
  "Indoor fireplace",
  "Smoking allowed",
  "Pets allowed",
  "EV charger",
];

const AdvancedSearch = () => {
  const router = useRouter();
  const searchModal = useSearchModal();
  const params = useSearchParams();
  const { getByValue } = useCountries();
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const locationValue = params?.get('locationValue'); 
  const startDate = params?.get('startDate');
  const endDate = params?.get('endDate');
  const guestCount = params?.get('guestCount');
  const category = params?.get('category');
  const selectedAmenities = params?.get('amenities')?.split(',') || [];

  const locationLabel = useMemo(() => {
    if (locationValue) {
      return getByValue(locationValue as string)?.label;
    }
    return 'Anywhere';
  }, [locationValue, getByValue]);

  const durationLabel = useMemo(() => {
    if (startDate && endDate) {
      const start = new Date(startDate as string);
      const end = new Date(endDate as string);
      let diff = differenceInDays(end, start);

      if (diff === 0) {
        diff = 1;
      }

      return `${diff} Days`;
    }
    return 'Any Week'
  }, [startDate, endDate]);

  const guestLabel = useMemo(() => {
    if (guestCount) {
      return `${guestCount} Guests`;
    }
    return 'Add Guests';
  }, [guestCount]);

  const handleSearch = useCallback(() => {
    if (params) {
      const searchParams = new URLSearchParams(params.toString());
      if (searchQuery) {
        searchParams.set('query', searchQuery);
      } else {
        searchParams.delete('query');
      }
      router.push(`/?${searchParams.toString()}`);
    }
  }, [searchQuery, params, router]);

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  return (
    <Container>
      <div className="flex flex-col gap-4 mt-4">
        {/* Search Bar */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 -z-20">
            <SearchInput
              id="search"
              label="Search by name or location"
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
            />
          </div>
          <div className="flex items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="
                flex items-center gap-2 text-sm font-semibold text-gray-600 
                hover:text-gray-800 transition px-4 py-2 rounded-full
                hover:bg-gray-100 whitespace-nowrap
              "
            >
              <BiFilterAlt size={20} />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="flex flex-col gap-6 p-4 bg-white rounded-lg shadow-md absolute w-full z-50">
            {/* Categories */}
            <div className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold text-gray-800">Categories</h3>
              <div className="flex flex-row items-center justify-start overflow-x-auto gap-2 pb-2">
                {categories.map((item) => (
                  <CategoryBox
                    key={item.label}
                    label={item.label}
                    icon={item.icon}
                    selected={category === item.label}
                  />
                ))}
              </div>
            </div>

            {/* Amenities */}
            <div className="flex flex-col gap-3">
              <h3 className="text-lg font-semibold text-gray-800">Amenities</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {amenities.map((amenity) => (
                  <div
                    key={amenity}
                    className={`
                      flex items-center gap-2 p-3 rounded-lg cursor-pointer
                      transition-all duration-200
                      ${selectedAmenities.includes(amenity) 
                        ? 'bg-rose-500 text-white shadow-md' 
                        : 'bg-gray-50 hover:bg-gray-100 hover:shadow-sm'
                      }
                    `}
                    onClick={() => {
                      const newAmenities = selectedAmenities.includes(amenity)
                        ? selectedAmenities.filter(a => a !== amenity)
                        : [...selectedAmenities, amenity];
                      
                      if (params) {
                        const searchParams = new URLSearchParams(params.toString());
                        searchParams.set('amenities', newAmenities.join(','));
                        router.push(`/?${searchParams.toString()}`);
                      }
                    }}
                  >
                    <span className="text-sm font-medium">{amenity}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Container>
  );
};

export default AdvancedSearch; 