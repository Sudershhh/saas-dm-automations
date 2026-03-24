import { useAutomationPosts } from "@/hooks/use-automations";
import { useQueryAutomationPosts } from "@/hooks/user-queries";
import React from "react";
import TriggerButton from "../trigger-button";
import { InstagramPostProps } from "@/types/posts.type";
import { CheckCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Loader from "../../loader";

type Props = {
  id: string;
};

const PostButton = ({ id }: Props) => {
  const params = useParams();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const integrationsHref = slug ? `/dashboard/${slug}/integrations` : "/dashboard";

  const { data } = useQueryAutomationPosts();
  const { posts, onSelectPost, mutate, isPending } = useAutomationPosts(id);

  const successBody =
    data?.status === 200 && data.data && typeof data.data === "object" && "data" in data.data
      ? (data.data as { data: unknown }).data
      : null;
  const mediaList = Array.isArray(successBody) ? (successBody as InstagramPostProps[]) : null;

  const errorPayload =
    data && data.status !== 200 && data.data && typeof data.data === "object"
      ? (data.data as { message?: string; needsReconnect?: boolean })
      : null;

  return (
    <TriggerButton label="Attach a post">
      {mediaList && mediaList.length > 0 ? (
        <div className="flex flex-col gap-y-3 w-full">
          <div className="flex flex-wrap w-full gap-3">
            {mediaList.map((post: InstagramPostProps) => (
              <div
                className="relative w-4/12 aspect-square rounded-lg cursor-pointer overflow-hidden"
                key={post.id}
                onClick={() =>
                  onSelectPost({
                    postid: post.id,
                    media: post.media_url,
                    mediaType: post.media_type,
                    caption: post.caption,
                  })
                }
              >
                {posts.find((p) => p.postid === post.id) && (
                  <CheckCircle
                    fill="white"
                    stroke="black"
                    className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50"
                  />
                )}
                <Image
                  fill
                  sizes="100vw"
                  src={post.media_url}
                  alt="post image"
                  className={cn(
                    "hover:opacity-75 transition duration-100",
                    posts.find((p) => p.postid === post.id) && "opacity-75",
                  )}
                />
              </div>
            ))}
          </div>
          <Button
            onClick={mutate}
            disabled={posts.length === 0}
            className="bg-gradient-to-br w-full from-[#3352CC] font-medium text-white to-[#1C2D70]"
          >
            <Loader state={isPending}>Attach Post</Loader>
          </Button>
        </div>
      ) : mediaList && mediaList.length === 0 ? (
        <p className="text-text-secondary text-center">No posts found!</p>
      ) : data?.status === 401 || errorPayload?.needsReconnect ? (
        <div className="flex flex-col gap-2 text-center text-text-secondary text-sm">
          <p>
            Your Instagram session expired or was revoked. Reconnect in Integrations to attach
            posts.
          </p>
          <Button
            asChild
            className="bg-gradient-to-br w-full from-[#3352CC] font-medium text-white to-[#1C2D70]"
          >
            <Link href={integrationsHref}>Open Integrations</Link>
          </Button>
        </div>
      ) : data?.status === 404 ? (
        <div className="flex flex-col gap-2 text-center text-text-secondary text-sm">
          <p>{errorPayload?.message ?? "Connect Instagram first."}</p>
          <Button
            asChild
            className="bg-gradient-to-br w-full from-[#3352CC] font-medium text-white to-[#1C2D70]"
          >
            <Link href={integrationsHref}>Open Integrations</Link>
          </Button>
        </div>
      ) : (
        <p className="text-text-secondary text-center">
          {errorPayload?.message ?? "No posts found!"}
        </p>
      )}
    </TriggerButton>
  );
};

export default PostButton;
