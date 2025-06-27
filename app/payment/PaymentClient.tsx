"use client";

import axios from "axios";
import { useState, useCallback } from "react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { FieldValues, SubmitHandler, useForm } from "react-hook-form";
import { format } from "date-fns";

import { safeListings, SafeUser } from "@/app/types";
import Container from "@/app/components/Container";
import Heading from "@/app/components/Heading";
import Button from "@/app/components/Button";
import Input from "@/app/components/inputs/Input";
import useChatModal from "@/app/hooks/useChatModal";
import BookingSummary from "./components/BookingSummary";
import PaymentMethodSelector from "./components/PaymentMethodSelector";
import BillingInformation from "./components/BillingInformation";
import GuestInformation from "./components/GuestInformation";

interface ReservationData {
  startDate: string;
  endDate: string;
  totalPrice: number;
}

interface PaymentClientProps {
  listing: safeListings & {
    user: SafeUser;
  };
  currentUser: SafeUser;
  reservationData: ReservationData;
}

const PaymentClient: React.FC<PaymentClientProps> = ({
  listing,
  currentUser,
  reservationData,
}) => {
  const router = useRouter();
  const chatModal = useChatModal();
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FieldValues>({
    defaultValues: {
      firstName: currentUser.name?.split(" ")[0] || "",
      lastName: currentUser.name?.split(" ").slice(1).join(" ") || "",
      email: currentUser.email || "",
      phone: "",

      billingFirstName: currentUser.name?.split(" ")[0] || "",
      billingLastName: currentUser.name?.split(" ").slice(1).join(" ") || "",
      billingAddress: "",
      billingCity: "",
      billingState: "",
      billingZip: "",
      billingCountry: "",

      cardNumber: "",
      expiryDate: "",
      cvv: "",
      cardHolderName: "",

      specialRequests: "",
      arrivalTime: "",
      guestCount: 1,
    },
  });

  const onSubmit: SubmitHandler<FieldValues> = useCallback(
    async (data) => {
      if (!paymentMethod) {
        toast.error("Please select a payment method");
        return;
      }

      setIsLoading(true);

      try {
        const reservationResponse = await axios.post("/api/reservations", {
          listingId: listing.id,
          startDate: reservationData.startDate,
          endDate: reservationData.endDate,
          totalPrice: reservationData.totalPrice,
          guestInfo: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            phone: data.phone,
            guestCount: data.guestCount,
          },
          billingInfo: {
            firstName: data.billingFirstName,
            lastName: data.billingLastName,
            address: data.billingAddress,
            city: data.billingCity,
            state: data.billingState,
            zip: data.billingZip,
            country: data.billingCountry,
          },
          paymentInfo: {
            method: paymentMethod,
            cardNumber: data.cardNumber
              ? `****-****-****-${data.cardNumber.slice(-4)}`
              : undefined,
          },
          specialRequests: data.specialRequests,
          arrivalTime: data.arrivalTime,
        });

        toast.success("Booking confirmed successfully!");

        chatModal.onOpen({
          reservationId: reservationResponse.data.id,
          hostId: listing.user.id,
          hostName: listing.user.name ?? undefined,
          listingTitle: listing.title,
        });

        setTimeout(() => {
          router.push(`/trips?booking=${reservationResponse.data.id}`);
        }, 2000);
      } catch (error) {
        console.error("Payment error:", error);
        toast.error(
          "Something went wrong with your booking. Please try again."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [
      listing.id,
      listing.user.id,
      listing.user.name,
      listing.title,
      reservationData,
      paymentMethod,
      router,
      chatModal,
    ]
  );

  const nextStep = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const steps = [
    { number: 1, title: "Guest Information", description: "Who's staying?" },
    { number: 2, title: "Billing Details", description: "Billing address" },
    { number: 3, title: "Payment Method", description: "How you'll pay" },
    { number: 4, title: "Review & Book", description: "Confirm your booking" },
  ];

  return (
    <Container>
      <div className="max-w-screen-xl mx-auto">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <Heading
              title="Complete your booking"
              subtitle={`Book your stay at ${listing.title}`}
            />
          </div>

          <div className="flex items-center justify-between mb-8">
            {steps.map((step, index) => (
              <>
                <div key={step.number} className="flex items-center">
                  <div
                    className={`
                      w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold
                      ${
                        currentStep >= step.number
                          ? "bg-rose-500 text-white"
                          : "bg-gray-200 text-gray-500"
                      }
                    `}
                  >
                    {step.number}
                  </div>
                  <div className="ml-3 hidden md:block">
                    <div
                      className={`text-sm font-medium ${
                        currentStep >= step.number
                          ? "text-rose-500"
                          : "text-gray-500"
                      }`}
                    >
                      {step.title}
                    </div>
                    <div className="text-xs text-gray-500">
                      {step.description}
                    </div>
                  </div>
                </div>
                {index < steps.length - 1 && (
                  <div
                    className={`w-full h-0.5 mx-4 ${
                      currentStep > step.number ? "bg-rose-500" : "bg-gray-200"
                    }`}
                  />
                )}
              </>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <form onSubmit={handleSubmit(onSubmit)}>
                {currentStep === 1 && (
                  <GuestInformation
                    register={register}
                    errors={errors}
                    watch={watch}
                    setValue={setValue}
                  />
                )}

                {currentStep === 2 && (
                  <BillingInformation
                    register={register}
                    errors={errors}
                    watch={watch}
                  />
                )}

                {currentStep === 3 && (
                  <PaymentMethodSelector
                    register={register}
                    errors={errors}
                    paymentMethod={paymentMethod}
                    setPaymentMethod={setPaymentMethod}
                  />
                )}

                {currentStep === 4 && (
                  <div className="space-y-6">
                    <Heading
                      title="Review your booking"
                      subtitle="Please confirm all details are correct"
                    />

                    <div className="bg-gray-50 p-6 rounded-lg space-y-4">
                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          Guest Information
                        </h3>
                        <p>
                          {watch("firstName")} {watch("lastName")}
                        </p>
                        <p>{watch("email")}</p>
                        <p>{watch("phone")}</p>
                        <p>Guests: {watch("guestCount")}</p>
                      </div>

                      <div>
                        <h3 className="font-semibold text-lg mb-2">
                          Payment Method
                        </h3>
                        <p className="capitalize">{paymentMethod}</p>
                        {paymentMethod === "credit-card" && (
                          <p>**** **** **** {watch("cardNumber")?.slice(-4)}</p>
                        )}
                      </div>

                      {watch("specialRequests") && (
                        <div>
                          <h3 className="font-semibold text-lg mb-2">
                            Special Requests
                          </h3>
                          <p>{watch("specialRequests")}</p>
                        </div>
                      )}
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        <strong>Cancellation policy:</strong> Free cancellation
                        up to 24 hours before check-in. After that, you&apos;ll
                        be charged for the first night.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex justify-between mt-8 space-x-4">
                  <Button
                    outline
                    label="Back"
                    onClick={prevStep}
                    disabled={currentStep === 1 || isLoading}
                  />

                  {currentStep < 4 ? (
                    <Button
                      label="Continue"
                      onClick={nextStep}
                      disabled={isLoading}
                    />
                  ) : (
                    <Button
                      label={isLoading ? "Processing..." : "Confirm & Pay"}
                      onClick={handleSubmit(onSubmit)}
                      disabled={isLoading}
                    />
                  )}
                </div>
              </form>
            </div>

            <div className="lg:col-span-1">
              <BookingSummary
                listing={listing}
                reservationData={reservationData}
              />
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
};

export default PaymentClient;
