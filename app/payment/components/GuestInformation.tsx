"use client";

import { FieldErrors, FieldValues, UseFormRegister, UseFormWatch, UseFormSetValue } from "react-hook-form";

import Heading from "@/app/components/Heading";
import Input from "@/app/components/inputs/Input";
import Counter from "@/app/components/inputs/Counter";

interface GuestInformationProps {
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  watch: UseFormWatch<FieldValues>;
  setValue: UseFormSetValue<FieldValues>;
}

const GuestInformation: React.FC<GuestInformationProps> = ({
  register,
  errors,
  watch,
  setValue,
}) => {
  const guestCount = watch("guestCount");

  return (
    <div className="space-y-6">
      <Heading
        title="Guest information"
        subtitle="Please provide details for the primary guest"
      />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="firstName"
          label="First name"
          disabled={false}
          register={register}
          errors={errors}
          required
        />
        
        <Input
          id="lastName"
          label="Last name"
          disabled={false}
          register={register}
          errors={errors}
          required
        />
      </div>
      
      <Input
        id="email"
        label="Email address"
        type="email"
        disabled={false}
        register={register}
        errors={errors}
        required
      />
      
      <Input
        id="phone"
        label="Phone number"
        type="tel"
        disabled={false}
        register={register}
        errors={errors}
        required
      />
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Number of guests
        </label>
        <Counter
          title="Guests"
          subtitle="How many guests will be staying?"
          value={guestCount}
          onChange={(value) => setValue("guestCount", value)}
        />
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Estimated arrival time (optional)
        </label>
        <select
          {...register("arrivalTime")}
          className="w-full p-4 border-2 border-neutral-300 rounded-md focus:border-black outline-none transition"
        >
          <option value="">Select arrival time</option>
          <option value="morning">Morning (8:00 AM - 12:00 PM)</option>
          <option value="afternoon">Afternoon (12:00 PM - 6:00 PM)</option>
          <option value="evening">Evening (6:00 PM - 10:00 PM)</option>
          <option value="late">Late evening (After 10:00 PM)</option>
          <option value="flexible">Flexible</option>
        </select>
      </div>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-gray-700">
          Special requests (optional)
        </label>
        <textarea
          {...register("specialRequests")}
          placeholder="Any special requests or accessibility needs?"
          rows={4}
          className="w-full p-4 border-2 border-neutral-300 rounded-md focus:border-black outline-none transition resize-none"
        />
      </div>
      
      <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Travel tip:</strong> Make sure the name on the booking matches your ID. 
          The host may ask to see your identification upon check-in.
        </p>
      </div>
    </div>
  );
};

export default GuestInformation;

