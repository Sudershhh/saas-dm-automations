import InfoBar from "@/components/global/InfoBar";
import Sidebar from "@/components/global/sidebar";
import React from "react";
import {
  QueryClient,
  dehydrate,
  HydrationBoundary,
} from "@tanstack/react-query";
import {
  prefetchUserProfile,
  prefetchUserAutomations,
} from "@/react-query/prefetch";

type Props = {
  children: React.ReactNode;
  params: { slug: string };
};

async function layout({ children, params }: Props) {
  //React Query

  const query = new QueryClient();

  await prefetchUserProfile(query);

  await prefetchUserAutomations(query);

  return (
    <HydrationBoundary state={dehydrate(query)}>
      <div className="p-3">
        <Sidebar slug={params.slug} />
        <div
          className="
      lg:ml-[250px] 
      lg:pl-10 
      lg:py-5 
      flex 
      flex-col 
      overflow-auto
      "
        >
          <InfoBar slug={params.slug} />
          {children}
        </div>
      </div>
    </HydrationBoundary>
  );
}

export default layout;
