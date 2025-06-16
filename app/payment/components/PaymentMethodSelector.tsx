"use client";

import { FieldErrors, FieldValues, UseFormRegister } from "react-hook-form";
import { useState } from "react";
import {
  FaCreditCard,
  FaPaypal,
  FaApplePay,
  FaGooglePay,
} from "react-icons/fa";
import { SiVisa, SiMastercard, SiAmericanexpress } from "react-icons/si";

import Heading from "@/app/components/Heading";
import Input from "@/app/components/inputs/Input";

interface PaymentMethodSelectorProps {
  register: UseFormRegister<FieldValues>;
  errors: FieldErrors;
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  register,
  errors,
  paymentMethod,
  setPaymentMethod,
}) => {
  const [cardType, setCardType] = useState("");

  const detectCardType = (cardNumber: string) => {
    const cleanNumber = cardNumber.replace(/\D/g, "");

    if (cleanNumber.startsWith("4")) {
      setCardType("visa");
    } else if (cleanNumber.startsWith("5") || cleanNumber.startsWith("2")) {
      setCardType("mastercard");
    } else if (cleanNumber.startsWith("3")) {
      setCardType("amex");
    } else {
      setCardType("");
    }
  };

  const formatCardNumber = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    const formattedValue = cleanValue.replace(/(\d{4})(?=\d)/g, "$1 ");
    return formattedValue;
  };

  const formatExpiryDate = (value: string) => {
    const cleanValue = value.replace(/\D/g, "");
    if (cleanValue.length >= 2) {
      return cleanValue.substring(0, 2) + "/" + cleanValue.substring(2, 4);
    }
    return cleanValue;
  };

  const paymentMethods = [
    {
      id: "credit-card",
      name: "Credit or Debit Card",
      icon: FaCreditCard,
      description: "Visa, Mastercard, American Express",
    },
    {
      id: "paypal",
      name: "PayPal",
      icon: FaPaypal,
      description: "Pay with your PayPal account",
    },
    {
      id: "apple-pay",
      name: "Apple Pay",
      icon: FaApplePay,
      description: "Pay with Touch ID or Face ID",
    },
    {
      id: "google-pay",
      name: "Google Pay",
      icon: FaGooglePay,
      description: "Pay with your Google account",
    },
  ];

  return (
    <div className="space-y-6">
      <Heading title="Payment method" subtitle="Choose how you'd like to pay" />

      <div className="space-y-4">
        {paymentMethods.map((method) => {
          const Icon = method.icon;
          return (
            <div
              key={method.id}
              onClick={() => setPaymentMethod(method.id)}
              className={`border-2 rounded-lg p-4 cursor-pointer transition ${
                paymentMethod === method.id
                  ? "border-rose-500 bg-rose-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <div className="flex items-center space-x-3">
                <input
                  type="radio"
                  name="paymentMethod"
                  value={method.id}
                  checked={paymentMethod === method.id}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="text-rose-500 focus:ring-rose-500"
                />
                <Icon className="w-6 h-6 text-gray-600" />
                <div>
                  <div className="font-medium text-gray-900">{method.name}</div>
                  <div className="text-sm text-gray-500">
                    {method.description}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {paymentMethod === "credit-card" && (
        <div className="space-y-4 p-6 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-medium text-gray-900">Card Information</h3>
            <div className="flex space-x-2">
              <SiVisa className="w-8 h-5 text-blue-600" />
              <SiMastercard className="w-8 h-5 text-red-600" />
              <SiAmericanexpress className="w-8 h-5 text-blue-500" />
            </div>
          </div>

          <div className="relative">
            <Input
              id="cardNumber"
              label="Card number"
              disabled={false}
              register={register}
              errors={errors}
              required
            />
            {cardType && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                {cardType === "visa" && (
                  <SiVisa className="w-6 h-4 text-blue-600" />
                )}
                {cardType === "mastercard" && (
                  <SiMastercard className="w-6 h-4 text-red-600" />
                )}
                {cardType === "amex" && (
                  <SiAmericanexpress className="w-6 h-4 text-blue-500" />
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              id="expiryDate"
              label="MM/YY"
              disabled={false}
              register={register}
              errors={errors}
              required
            />

            <Input
              id="cvv"
              label="CVV"
              disabled={false}
              register={register}
              errors={errors}
              required
            />
          </div>

          <Input
            id="cardHolderName"
            label="Cardholder name"
            disabled={false}
            register={register}
            errors={errors}
            required
          />

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="saveCard"
              {...register("saveCard")}
              className="rounded border-gray-300 text-rose-500 focus:ring-rose-500"
            />
            <label htmlFor="saveCard" className="text-sm text-gray-700">
              Save this card for future bookings
            </label>
          </div>
        </div>
      )}

      {paymentMethod === "paypal" && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            You&#39;ll be redirected to PayPal to complete your payment
            securely.
          </p>
        </div>
      )}

      {paymentMethod === "apple-pay" && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            You&#39;ll use Touch ID or Face ID to complete your payment.
          </p>
        </div>
      )}

      {paymentMethod === "google-pay" && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            You&#39;ll be redirected to Google Pay to complete your payment.
          </p>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 p-4 rounded-lg">
        <p className="text-sm text-gray-600">
          <strong>Security:</strong> Your payment information is encrypted and
          secure. We use industry-standard security measures to protect your
          data.
        </p>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
