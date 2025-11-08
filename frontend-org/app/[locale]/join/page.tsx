"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import Image from "next/image";
import Link from "next/link";
import QRCode from "qrcode";
import { Plus, Minus, ChevronDown, ChevronUp } from "lucide-react";

import {
  registrationFormSchema,
  type RegistrationFormData,
} from "@/library/validations/membership";
import { registerUserWithFamily } from "@/library/api/services";

export default function JoinPage() {
  const t = useTranslations("membership");
  const [submitted, setSubmitted] = useState(false);
  const [paymentData, setPaymentData] = useState<{
    amount: number;
    reference: string;
    qrCode: string;
  } | null>(null);
  const [showPartner, setShowPartner] = useState(false);
  const [showChildren, setShowChildren] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<RegistrationFormData>({
    resolver: zodResolver(registrationFormSchema),
    defaultValues: {
      adult1: {
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
      },
      adult2: {
        firstname: "",
        lastname: "",
        email: "",
        phone: "",
      },
      children: [],
      consentProcessing: false,
      password: "",
      password2: "",
      module: "ORG",
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "children",
  });

  const onSubmit = async (data: RegistrationFormData) => {
    setApiError(null);

    try {
      // Prepare partner data if second adult is filled
      const partner =
        data.adult2 &&
        (data.adult2.firstname ||
          data.adult2.lastname ||
          data.adult2.email ||
          data.adult2.phone)
          ? {
              firstname: data.adult2.firstname!,
              lastname: data.adult2.lastname!,
              birthday: "1990-01-01", // TODO: collect birthday for adults
              consent_pictures: true,
            }
          : undefined;

      // Prepare children array
      const children =
        data.children.length > 0
          ? data.children.map((child) => ({
              firstname: child.firstname,
              lastname: child.lastname,
              birthday: child.birthday,
              consent_pictures: false, // Children under 18 don't need consent
            }))
          : undefined;

      // Register user + create family
      await registerUserWithFamily({
        email: data.adult1.email,
        password: data.password,
        password2: data.password2,
        module: data.module,
        partner,
        children,
      });

      // For now, calculate payment amount (TODO: get from backend)
      const hasPartner = !!partner;
      const paymentAmount =
        hasPartner || (children && children.length > 0) ? 250 : 150;
      const paymentReference = `REF-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;

      // Generate QR code for Swish payment
      const membershipText = `${t("payment.membership_for")} ${new Date().getFullYear()} - ${data.adult1.firstname} ${data.adult1.lastname}`;
      const qrData = `C${paymentAmount};${paymentReference};${membershipText};0`;

      const qrCodeUrl = await QRCode.toDataURL(qrData, {
        width: 500,
        margin: 0,
      });

      setPaymentData({
        amount: paymentAmount,
        reference: paymentReference,
        qrCode: qrCodeUrl,
      });

      setSubmitted(true);
    } catch (error) {
      if (error instanceof Error) {
        setApiError(error.message);
      } else {
        setApiError(t("error.generic"));
      }
    }
  };

  if (submitted && paymentData) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-12">
        <div className="rounded-lg bg-white p-8 shadow-lg">
          <h1 className="mb-6 text-center text-3xl font-bold text-green-600">
            {t("success.title")}
          </h1>

          <div className="mb-8 text-center">
            <p className="mb-4 text-gray-600">{t("success.message")}</p>
          </div>

          <div className="mb-8 flex flex-col items-center">
            <div className="mb-4 rounded-lg bg-gray-50 p-4">
              <Image
                src={paymentData.qrCode}
                alt="Swish QR Code"
                width={256}
                height={256}
                className="h-64 w-64"
              />
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{paymentData.amount} SEK</p>
              <p className="text-sm text-gray-500">
                {t("payment.reference")}: {paymentData.reference}
              </p>
            </div>
          </div>

          <div className="mb-8 space-y-2 rounded-lg bg-blue-50 p-4">
            <p className="font-medium text-blue-900">
              {t("payment.instructions")}
            </p>
            <ol className="list-decimal space-y-1 pl-5 text-sm text-blue-800">
              <li>{t("payment.steps.1")}</li>
              <li>{t("payment.steps.2")}</li>
              <li>{t("payment.steps.3")}</li>
              <li>{t("payment.steps.4")}</li>
            </ol>
          </div>

          <Link
            href="/"
            className="block w-full rounded-lg bg-blue-600 px-6 py-3 text-center font-medium text-white hover:bg-blue-700"
          >
            {t("success.back")}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-12">
      <div className="mb-8 text-center">
        <h1 className="mb-2 text-4xl font-bold">{t("title")}</h1>
        <p className="text-gray-600">{t("subtitle")}</p>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="rounded-lg bg-white p-8 shadow-lg"
      >
        {/* Primary Adult Section */}
        <div className="mb-8">
          <h2 className="mb-4 text-2xl font-semibold">
            {t("form.section_adult1")}
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                {t("form.firstname")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("adult1.firstname")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="Namn"
              />
              {errors.adult1?.firstname && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.adult1.firstname.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                {t("form.lastname")} <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                {...register("adult1.lastname")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="Namnsson"
              />
              {errors.adult1?.lastname && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.adult1.lastname.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                {t("form.email")} <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                {...register("adult1.email")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="namn@namnsson.se"
              />
              {errors.adult1?.email && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.adult1.email.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                {t("form.phone")} <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                {...register("adult1.phone")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="+4687461000"
              />
              {errors.adult1?.phone && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.adult1.phone.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Account Password Section */}
        <div className="mb-8 rounded-lg bg-blue-50 p-6">
          <h3 className="mb-4 text-lg font-semibold">
            {t("form.create_account")}
          </h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-medium">
                {t("form.password")} <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                {...register("password")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="••••••••"
              />
              {errors.password && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.password.message}
                </p>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium">
                {t("form.password2")} <span className="text-red-500">*</span>
              </label>
              <input
                type="password"
                {...register("password2")}
                className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                placeholder="••••••••"
              />
              {errors.password2 && (
                <p className="mt-1 text-sm text-red-500">
                  {errors.password2.message}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Partner/Second Adult Section */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => setShowPartner(!showPartner)}
            className="mb-4 flex w-full items-center justify-between rounded-lg bg-gray-50 px-4 py-3 text-left font-medium hover:bg-gray-100"
          >
            <span>{t("form.section_adult2")}</span>
            {showPartner ? <ChevronUp /> : <ChevronDown />}
          </button>

          {showPartner && (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium">
                  {t("form.firstname")}
                </label>
                <input
                  type="text"
                  {...register("adult2.firstname")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="Namn"
                />
                {errors.adult2?.firstname && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.adult2.firstname.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  {t("form.lastname")}
                </label>
                <input
                  type="text"
                  {...register("adult2.lastname")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="Namnsson"
                />
                {errors.adult2?.lastname && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.adult2.lastname.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  {t("form.email")}
                </label>
                <input
                  type="email"
                  {...register("adult2.email")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="namn@namnsson.se"
                />
                {errors.adult2?.email && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.adult2.email.message}
                  </p>
                )}
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium">
                  {t("form.phone")}
                </label>
                <input
                  type="tel"
                  {...register("adult2.phone")}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                  placeholder="+4687461000"
                />
                {errors.adult2?.phone && (
                  <p className="mt-1 text-sm text-red-500">
                    {errors.adult2.phone.message}
                  </p>
                )}
              </div>

              {errors.adult2 && typeof errors.adult2.message === "string" && (
                <div className="col-span-2">
                  <p className="text-sm text-red-500">
                    {errors.adult2.message}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Children Section */}
        <div className="mb-8">
          <button
            type="button"
            onClick={() => setShowChildren(!showChildren)}
            className="mb-4 flex w-full items-center justify-between rounded-lg bg-gray-50 px-4 py-3 text-left font-medium hover:bg-gray-100"
          >
            <span>{t("form.section_children")}</span>
            {showChildren ? <ChevronUp /> : <ChevronDown />}
          </button>

          {showChildren && (
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="rounded-lg border border-gray-200 p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-medium">
                      {t("form.section_children")} {index + 1}
                    </h3>
                    <button
                      type="button"
                      onClick={() => remove(index)}
                      className="flex items-center gap-1 text-sm text-red-600 hover:text-red-700"
                    >
                      <Minus size={16} />
                      {t("form.remove_child")}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        {t("form.firstname")}
                      </label>
                      <input
                        type="text"
                        {...register(`children.${index}.firstname`)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                      />
                      {errors.children?.[index]?.firstname && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.children[index]?.firstname?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        {t("form.lastname")}
                      </label>
                      <input
                        type="text"
                        {...register(`children.${index}.lastname`)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                      />
                      {errors.children?.[index]?.lastname && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.children[index]?.lastname?.message}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="mb-1 block text-sm font-medium">
                        {t("form.birthday")}
                      </label>
                      <input
                        type="date"
                        {...register(`children.${index}.birthday`)}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
                      />
                      {errors.children?.[index]?.birthday && (
                        <p className="mt-1 text-sm text-red-500">
                          {errors.children[index]?.birthday?.message}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}

              {fields.length < 10 && (
                <button
                  type="button"
                  onClick={() =>
                    append({ firstname: "", lastname: "", birthday: "" })
                  }
                  className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-gray-600 hover:border-blue-500 hover:text-blue-600"
                >
                  <Plus size={20} />
                  {t("form.add_child")}
                </button>
              )}

              {fields.length >= 10 && (
                <p className="text-sm text-gray-500">
                  {t("form.max_children")}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Consent */}
        <div className="mb-6">
          <label className="flex items-start gap-2">
            <input
              type="checkbox"
              {...register("consentProcessing")}
              className="mt-1 h-4 w-4"
            />
            <span className="text-sm">
              {t("form.consent")}{" "}
              <a
                href="/privacy-policy"
                target="_blank"
                className="text-blue-600 hover:underline"
              >
                {t("form.consent_link")}
              </a>
            </span>
          </label>
          {errors.consentProcessing && (
            <p className="mt-1 text-sm text-red-500">
              {errors.consentProcessing.message}
            </p>
          )}
        </div>

        {/* API Error */}
        {apiError && (
          <div className="mb-6 rounded-lg bg-red-50 p-4 text-red-700">
            {apiError}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full rounded-lg bg-blue-600 px-6 py-3 font-medium text-white hover:bg-blue-700 disabled:bg-gray-400"
        >
          {isSubmitting ? "Submitting..." : t("form.submit")}
        </button>
      </form>
    </div>
  );
}
