"use server";

import { client } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import { SUBSCRIPTION_PLAN } from "@prisma/client";

export const findUser = async (clerkId: string) => {
  return await client.user.findUnique({
    where: {
      clerkId,
    },
    include: {
      subscription: true,
      integrations: {
        select: {
          id: true,
          token: true,
          expiresAt: true,
          name: true,
        },
      },
    },
  });
};

export const createUser = async (
  clerkId: string,
  firstname: string,
  lastname: string,
  email: string
) => {
  return await client.user.create({
    data: {
      clerkId,
      firstname,
      lastname,
      email,
      subscription: {
        create: {},
      },
    },
    select: {
      firstname: true,
      lastname: true,
    },
  });
};

/** Updates or creates the user's single Subscription row (schema: User.subscription 1:1). */
export const updateSubscription = async (
  clerkId: string,
  props: {
    plan?: SUBSCRIPTION_PLAN;
    customerId?: string | null;
  }
) => {
  const create: Prisma.SubscriptionCreateWithoutUserInput = {
    plan: props.plan ?? SUBSCRIPTION_PLAN.FREE,
    ...(props.customerId != null && props.customerId !== ""
      ? { customerId: props.customerId }
      : {}),
  };

  const update: Prisma.SubscriptionUpdateWithoutUserInput = {
    updatedAt: new Date(),
    ...(props.plan !== undefined ? { plan: props.plan } : {}),
    ...(props.customerId !== undefined ? { customerId: props.customerId } : {}),
  };

  return await client.user.update({
    where: {
      clerkId,
    },
    data: {
      subscription: {
        upsert: {
          create,
          update,
        },
      },
    },
  });
};
