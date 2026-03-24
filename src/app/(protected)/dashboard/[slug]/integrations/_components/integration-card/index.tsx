"use client";
import { onOAuthInstagram } from "@/actions/integrations";
import { onUserInfo } from "@/actions/user";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import React from "react";

type Props = {
  title: string;
  description: string;
  icon: React.ReactNode;
  strategy: "INSTAGRAM" | "CRM";
};

const IntegrationCard = ({ description, icon, strategy, title }: Props) => {
  const onInstaOAuth = () => onOAuthInstagram(strategy);

  const { data } = useQuery({
    queryKey: ["user-profile"],
    queryFn: onUserInfo,
  });

  const integrated = data?.data?.integrations.find(
    (integration) => integration.name === strategy
  );

  return (
    <div className="border-2 border-[#3352CC] rounded-2xl gap-x-5 p-5 flex items-center justify-between">
      {icon}
      <div className="flex flex-col flex-1">
        <h3 className="text-xl"> {title}</h3>
        <p className="text-[#9D9D9D] text-base ">{description}</p>
      </div>
      <Button
        onClick={onInstaOAuth}
        disabled={integrated?.name === strategy}
        className="bg-gradient-to-br text-white rounded-full text-lg from-[#3352CC] font-medium to-[#1C2D70] hover:opacity-70 transition duration-100"
      >
        {integrated ? "Connected" : "Connect"}
      </Button>
    </div>
  );
};

export default IntegrationCard;
