"use client";

import axios from "axios";
import { toast } from "react-hot-toast";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import useEditModal from "@/app/hooks/useEditModal";

import Modal from "./Modal";
import Counter from "../inputs/Counter";
import CategoryInput from "../inputs/CategoryInput";
import CountrySelect from "../inputs/CountrySelect";
import { categories } from "../navbar/Categories";
import ImageUpload from "../inputs/ImageUpload";
import Input from "../inputs/Input";
import Heading from "../Heading";

enum STEPS {
  CATEGORY = 0,
  LOCATION = 1,
  IMAGES = 2,
  INFO = 3,
}

interface Listing {
  id: string;
  title: string;
  description: string;
  imageSrc: string;
  category: string;
  roomCount: number;
  bathroomCount: number;
  guestCount: number;
  locationValue: string;
  price: number;
}

const EditModal = () => {
  const router = useRouter();
  const editModal = useEditModal();

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(STEPS.CATEGORY);
  const [listing, setListing] = useState<Listing | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm<FieldValues>({
    defaultValues: {
      category: "",
      location: null,
      exactLocation: "",
      guestCount: 1,
      roomCount: 1,
      bathroomCount: 1,
      imageSrc: "",
      price: 1,
      title: "",
      description: "",
      amenities: [],
    },
  });

  // Fetch listing data when modal opens
  useEffect(() => {
    if (editModal.listingId) {
      setIsLoading(true);
      axios
        .get(`/api/listings/${editModal.listingId}`)
        .then((response) => {
          const listingData = response.data;
          setListing(listingData);

          // Set form values from listing data
          setValue("category", listingData.category);
          setValue("location", {
            value: listingData.locationValue,
            label: listingData.locationValue,
            latlng: [0, 0], // You might need to adjust this based on your data structure
            region: "",
            flag: "",
          });
          setValue("exactLocation", listingData.exactLocation || "");
          setValue("guestCount", listingData.guestCount);
          setValue("roomCount", listingData.roomCount);
          setValue("bathroomCount", listingData.bathroomCount);
          setValue("imageSrc", listingData.imageSrc);
          setValue("price", listingData.price);
          setValue("title", listingData.title);
          setValue("description", listingData.description);
          setValue("amenities", listingData.amenities || []);
        })
        .catch((error) => {
          toast.error("Something went wrong");
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [editModal.listingId, setValue]);

  const location = watch("location");
  const category = watch("category");
  const guestCount = watch("guestCount");
  const roomCount = watch("roomCount");
  const bathroomCount = watch("bathroomCount");
  const imageSrc = watch("imageSrc");
  const amenities = watch("amenities");
  const exactLocation = watch("exactLocation");

  const Map = useMemo(
    () =>
      dynamic(() => import("../Map"), {
        ssr: false,
      }),
    [location]
  );

  const setCustomValue = (id: string, value: any) => {
    setValue(id, value, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  const onBack = () => {
    setStep((value) => value - 1);
  };

  const onNext = () => {
    setStep((value) => value + 1);
  };

  const onSubmit: SubmitHandler<FieldValues> = (data) => {
    if (step !== STEPS.INFO) {
      return onNext();
    }

    // Make sure amenities is an array
    if (!data.amenities) {
      data.amenities = [];
    }

    setIsLoading(true);

    axios
      .put(`/api/listings/${editModal.listingId}`, data)
      .then(() => {
        toast.success("Listing updated!");
        router.refresh();
        reset();
        setStep(STEPS.CATEGORY);
        editModal.onClose();
      })
      .catch(() => {
        toast.error("Something went wrong.");
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const actionLabel = useMemo(() => {
    if (step === STEPS.INFO) {
      return "Update";
    }

    return "Next";
  }, [step]);

  const secondaryActionLabel = useMemo(() => {
    if (step === STEPS.CATEGORY) {
      return undefined;
    }

    return "Back";
  }, [step]);

  let bodyContent = (
    <div className="flex flex-col gap-8">
      <Heading
        title="Which of these best describes your place?"
        subtitle="Pick a category"
      />
      <div
        className="
          grid 
          grid-cols-1 
          md:grid-cols-2 
          gap-3
          max-h-[50vh]
          overflow-y-auto
        "
      >
        {categories.map((item) => (
          <div key={item.label} className="col-span-1">
            <CategoryInput
              onClick={(category) => setCustomValue("category", category)}
              selected={category === item.label}
              label={item.label}
              icon={item.icon}
            />
          </div>
        ))}
      </div>
    </div>
  );

  if (step === STEPS.LOCATION) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Where is your place located?"
          subtitle="Help guests find you!"
        />
        <CountrySelect
          value={location}
          onChange={(value) => setCustomValue("location", value)}
        />
        <Map center={location?.latlng} />
      </div>
    );
  }

  if (step === STEPS.IMAGES) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Add a photo of your place"
          subtitle="Show guests what your place looks like!"
        />
        <ImageUpload
          onChange={(value) => setCustomValue("imageSrc", value)}
          value={imageSrc}
        />
      </div>
    );
  }

  if (step === STEPS.INFO) {
    bodyContent = (
      <div className="flex flex-col gap-8 overflow-y-auto max-h-[65vh]">
        <Heading
          title="Share details about your place"
          subtitle="What amenities do you have and how would you describe it?"
        />

        {/* Basic Info Section */}
        <div className="flex flex-col gap-4">
          <h2 className="font-semibold text-lg">Basic Information</h2>
          <Counter
            onChange={(value) => setCustomValue("guestCount", value)}
            value={guestCount}
            title="Guests"
            subtitle="How many guests do you allow?"
          />
          <hr />
          <Counter
            onChange={(value) => setCustomValue("roomCount", value)}
            value={roomCount}
            title="Rooms"
            subtitle="How many rooms do you have?"
          />
          <hr />
          <Counter
            onChange={(value) => setCustomValue("bathroomCount", value)}
            value={bathroomCount}
            title="Bathrooms"
            subtitle="How many bathrooms do you have?"
          />
        </div>

        {/* Location Section */}
        <div className="flex flex-col gap-4 mt-6">
          <h2 className="font-semibold text-lg">Location</h2>
          <Input
            id="exactLocation"
            label="Exact Location"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
          />
          <CountrySelect
            value={location}
            onChange={(value) => setCustomValue("location", value)}
          />
          <Map center={location?.latlng} />
        </div>

        {/* Amenities Section */}
        <div className="flex flex-col gap-4 mt-6">
          <h2 className="font-semibold text-lg">Amenities</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
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
            ].map((amenity) => (
              <div key={amenity} className="col-span-1">
                <CategoryInput
                  onClick={(value) => {
                    const current = amenities || [];
                    const updated = current.includes(value)
                      ? current.filter((item: any) => item !== value)
                      : [...current, value];

                    setCustomValue("amenities", updated);
                  }}
                  selected={amenities?.includes(amenity)}
                  label={amenity}
                  icon={undefined}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Description Section */}
        <div className="flex flex-col gap-4 mt-6">
          <h2 className="font-semibold text-lg">Description</h2>
          <Input
            id="title"
            label="Title"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
          />
          <hr />
          <Input
            id="description"
            label="Description"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
          />
        </div>

        {/* Price Section */}
        <div className="flex flex-col gap-4 mt-6">
          <h2 className="font-semibold text-lg">Price</h2>
          <Input
            id="price"
            label="Price"
            formatPrice
            type="number"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
          />
        </div>
      </div>
    );
  }

  return (
    <Modal
      disabled={isLoading}
      isOpen={editModal.isOpen}
      title="Edit your listing"
      actionLabel={actionLabel}
      onSubmit={handleSubmit(onSubmit)}
      secondaryActionLabel={secondaryActionLabel}
      secondaryAction={step === STEPS.CATEGORY ? undefined : onBack}
      onClose={editModal.onClose}
      body={bodyContent}
    />
  );
};

export default EditModal;
