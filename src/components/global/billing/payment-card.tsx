"use client";

import { Button } from "@/components/ui/button";
import { PLANS } from "@/constants/pages";
import { useSubscription } from "@/hooks/use-subscription";
import { cn } from "@/lib/utils";
import { CircleCheck, Loader2 } from "lucide-react";
import React from "react";

type Props = {
  label: string;
  current: "PRO" | "FREE";
  landing?: boolean;
};

const PaymentCard = ({ current, label, landing }: Props) => {
  const { onSubscribe, isProcessing } = useSubscription();
  const upgradingThisCard = label === "PRO" && isProcessing;

  return (
    <div
      className={cn(
        label !== current
          ? "bg-in-active"
          : "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500",
        "p-[2px] rounded-xl overflow-hidden"
      )}
    >
      <div
        className={cn(
          landing && "radial--gradient--pink",
          "flex flex-col rounded-xl pl-5 py-5 pr-10 bg-background-90 h-full"
        )}
      >
        {landing ? (
          <h2 className="text-2xl">
            {label === "PRO" && "Premium Plan"}
            {label === "FREE" && "Standard"}
          </h2>
        ) : (
          <h2 className="text-2xl">
            {label === current
              ? "Your Current Plan"
              : current === "PRO"
              ? "Downgrade"
              : "Upgrade"}
          </h2>
        )}
        <p className="text-text-secondary text-sm mb-2">
          This is what your plan covers for automations and Ai features
        </p>
        {label === "PRO" ? (
          <span className="bg-gradient-to-r text-3xl from-indigo-500 via-purple-500 font-bold to-pink-500 bg-clip-text text-transparent">
            Smart AI
          </span>
        ) : (
          <p className="font-bold mt-2 text-text-secondary">Standard</p>
        )}
        {label === "PRO" ? (
          <p className="mb-2">
            <b className="text-xl">$99</b>/month
          </p>
        ) : (
          <p className="text-xl mb-2">Free</p>
        )}

        {PLANS[label === "PRO" ? 1 : 0].features.map((i) => (
          <p key={i} className="mt-2 text-muted-foreground flex gap-2 ">
            <CircleCheck className="text-indigo-500" />
            {i}
          </p>
        ))}

        {landing ? (
          <Button
            className={cn(
              "rounded-full mt-5",
              label === "PRO"
                ? "bg-gradient-to-r from-indigo-500 text-white via-purple-500 to-pink-500"
                : "bg-background-80 text-white hover:text-background-80"
            )}
          >
            {label === current
              ? "Get Started"
              : current === "PRO"
              ? "Free"
              : "Get Started"}
          </Button>
        ) : (
          <Button
            className="rounded-full mt-5 bg-background-80 text-white hover:text-background-80"
            disabled={
              label === current ||
              upgradingThisCard ||
              (label === "FREE" && current === "PRO")
            }
            onClick={() => {
              if (label === "PRO" && current === "FREE") {
                void onSubscribe();
              }
            }}
          >
            {upgradingThisCard ? (
              <Loader2 className="size-4 animate-spin" />
            ) : label === current ? (
              "Active"
            ) : current === "PRO" ? (
              "Downgrade"
            ) : (
              "Upgrade"
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

export default PaymentCard;
