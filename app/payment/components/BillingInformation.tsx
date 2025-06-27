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
    if (checked) {
      register("billingFirstName").onChange({ target: { value: firstName } });
      register("billingLastName").onChange({ target: { value: lastName } });
    } else {
      register("billingFirstName").onChange({ target: { value: "" } });
      register("billingLastName").onChange({ target: { value: "" } });
    }
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
          <CountrySelect
            value={watch("billingCountry")}
            onChange={(value) =>
              register("billingCountry").onChange({ target: { value } })
            }
          />
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
