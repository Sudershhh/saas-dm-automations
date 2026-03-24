"use client";
import PaymentCard from "./payment-card";
import { useQueryUser } from "@/hooks/user-queries";

type Props = {};

function Billing({}: Props) {
  const { data } = useQueryUser();
  const plan =
    data?.data?.subscription?.plan === "PRO" ? "PRO" : "FREE";

  return (
    <div className="dlex lg:flex-row flex flex-col gap-5 w-full lg:w-10/12 xl:w-8/12 container">
      <PaymentCard label="PRO" current={plan} />
      <PaymentCard label="FREE" current={plan} />
    </div>
  );
}

export default Billing;
