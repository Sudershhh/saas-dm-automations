import React from "react";

type Props = {
  title: string;
  description: string;
  icon: React.ReactNode;
  strategy: "INSTAGRAM" | "CRM";
};

function IntegrationCard({ description, icon, strategy, title }: Props) {
  return (
    <div className="border-2 border-[#3352CC] rounded-2xl gap-x-5 p-5 flex items-center">
      {icon}
      <div className="flex flex-col flex-q">
        <h3 className="text-xl">{title}</h3>
        <p className="text-[#9d9d9d] text-base w-full md:w-10/12 xl:w-8/12 2xl:w-6/12">
          {description}
        </p>
      </div>
    </div>
  );
}

export default IntegrationCard;
