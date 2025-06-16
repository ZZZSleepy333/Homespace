"use client";

import {
  FieldErrors,
  FieldValues,
  UseFormRegister,
  UseFormWatch,
} from "react-hook-form";
import { useState } from "react";

import Heading from "@/app/components/Heading";
import Input from "@/app/components/inputs/Input";
import CountrySelect from "@/app/components/inputs/CountrySelect";

interface BillingInformationProps {
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  watch: UseFormWatch<FieldValues>;
}

const BillingInformation: React.FC<BillingInformationProps> = ({
  register,
  errors,
  watch,
}) => {
  const [sameAsGuest, setSameAsGuest] = useState(false);

  const firstName = watch("firstName");
  const lastName = watch("lastName");

  const handleSameAsGuest = (checked: boolean) => {
    setSameAsGuest(checked);
    // This would need to be implemented with setValue if you want to auto-fill
    // For now, it's just a visual indicator
  };

  return (
    <div className="space-y-6">
      <Heading
        title="Billing information"
        subtitle="Enter the billing address for your payment method"
      />

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="sameAsGuest"
          checked={sameAsGuest}
          onChange={(e) => handleSameAsGuest(e.target.checked)}
          className="rounded border-gray-300 text-rose-500 focus:ring-rose-500"
        />
        <label htmlFor="sameAsGuest" className="text-sm text-gray-700">
          Billing information is the same as guest information
        </label>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="billingFirstName"
          label="First name"
          disabled={false}
          register={register}
          errors={errors}
          required
        />

        <Input
          id="billingLastName"
          label="Last name"
          disabled={false}
          register={register}
          errors={errors}
          required
        />
      </div>

      <Input
        id="billingAddress"
        label="Street address"
        disabled={false}
        register={register}
        errors={errors}
        required
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="billingCity"
          label="City"
          disabled={false}
          register={register}
          errors={errors}
          required
        />

        <Input
          id="billingState"
          label="State/Province"
          disabled={false}
          register={register}
          errors={errors}
          required
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          id="billingZip"
          label="ZIP/Postal code"
          disabled={false}
          register={register}
          errors={errors}
          required
        />

        <div className="space-y-2">
          <select
            {...register("billingCountry", { required: true })}
            className={`w-full p-4 border-2 rounded-md outline-none transition ${
              errors.billingCountry
                ? "border-rose-500"
                : "border-neutral-300 focus:border-black"
            }`}
          >
            <option value="">Select country</option>
            <option value="US">United States</option>
            <option value="CA">Canada</option>
            <option value="UK">United Kingdom</option>
            <option value="AU">Australia</option>
            <option value="DE">Germany</option>
            <option value="FR">France</option>
            <option value="ES">Spain</option>
            <option value="IT">Italy</option>
            <option value="JP">Japan</option>
            <option value="KR">South Korea</option>
            <option value="VN">Vietnam</option>
            <option value="TH">Thailand</option>
            <option value="SG">Singapore</option>
            <option value="MY">Malaysia</option>
            <option value="ID">Indonesia</option>
            <option value="PH">Philippines</option>
            <option value="IN">India</option>
            <option value="CN">China</option>
            <option value="BR">Brazil</option>
            <option value="MX">Mexico</option>
          </select>
          {errors.billingCountry && (
            <span className="text-rose-500 text-sm">Country is required</span>
          )}
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Note:</strong> Your billing address should match the address
          associated with your payment method for security verification.
        </p>
      </div>
    </div>
  );
};

export default BillingInformation;
