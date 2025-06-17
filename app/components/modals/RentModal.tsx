"use client";

import axios from "axios";
import { toast } from "react-hot-toast";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import useRentModal from "@/app/hooks/useRentModal";

import Modal from "./Modal";
import Counter from "../inputs/Counter";
import CategoryInput from "../inputs/CategoryInput";
import { categories } from "../navbar/Categories";
import ImageUpload from "../inputs/ImageUpload";
import Input from "../inputs/Input";
import Heading from "../Heading";

enum STEPS {
  CATEGORY = 0,
  IMAGES = 1,
  INFO = 2,
}

const RentModal = () => {
  const router = useRouter();
  const rentModal = useRentModal();

  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState(STEPS.CATEGORY);

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
      location: "",
      guestCount: 1,
      roomCount: 1,
      bathroomCount: 1,
      imageSrc: [],
      price: 1,
      title: "",
      description: "",
      amenities: [],
    },
  });

  const location = watch("location");
  const category = watch("category");
  const guestCount = watch("guestCount");
  const roomCount = watch("roomCount");
  const bathroomCount = watch("bathroomCount");
  const imageSrc = watch("imageSrc");
  const amenities = watch("amenities");

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

    setIsLoading(true);

    axios
      .post("/api/listings", data)
      .then(() => {
        toast.success("Listing created!");
        router.refresh();
        reset();
        setStep(STEPS.CATEGORY);
        rentModal.onClose();
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
      return "Create";
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
    <div className="flex flex-col gap-8 z-10">
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

  if (step === STEPS.IMAGES) {
    bodyContent = (
      <div className="flex flex-col gap-8">
        <Heading
          title="Add photos of your place"
          subtitle="Show guests what your place looks like! (Max 10 photos)"
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

        <div className="flex flex-col gap-4 mt-6">
          <h2 className="font-semibold text-lg">Location</h2>
          <Input
            id="location"
            label="Location"
            disabled={isLoading}
            register={register}
            errors={errors}
            required
          />
        </div>

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
          <textarea
            id="description"
            {...register("description", { required: true })}
            className="
              w-full
              p-4
              font-light
              bg-white
              border-2
              rounded-md
              outline-none
              transition
              disabled:opacity-70
              disabled:cursor-not-allowed
              pl-4
              pt-4
              min-h-[150px]
            "
            placeholder="Description"
            disabled={isLoading}
          />
          {errors.description && (
            <span className="text-rose-500">This field is required</span>
          )}
        </div>

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
      isOpen={rentModal.isOpen}
      title="Airbnb your home!"
      actionLabel={actionLabel}
      onSubmit={handleSubmit(onSubmit)}
      secondaryActionLabel={secondaryActionLabel}
      secondaryAction={step === STEPS.CATEGORY ? undefined : onBack}
      onClose={rentModal.onClose}
      body={bodyContent}
    />
  );
};

export default RentModal;
