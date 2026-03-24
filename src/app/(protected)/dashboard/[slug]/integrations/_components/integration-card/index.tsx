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
      <div className="flex flex-col items-end gap-2 shrink-0">
        {integrated ? (
          <>
            <span className="text-sm text-[#9D9D9D]">Connected</span>
            <Button
              onClick={onInstaOAuth}
              variant="outline"
              className="rounded-full text-lg border-[#3352CC] text-[#768BDD] hover:bg-[#3352CC]/10"
            >
              Reconnect
            </Button>
          </>
        ) : (
          <Button
            onClick={onInstaOAuth}
            className="bg-gradient-to-br text-white rounded-full text-lg from-[#3352CC] font-medium to-[#1C2D70] hover:opacity-70 transition duration-100"
          >
            Connect
          </Button>
        )}
      </div>
    </div>
  );
};

export default IntegrationCard;
