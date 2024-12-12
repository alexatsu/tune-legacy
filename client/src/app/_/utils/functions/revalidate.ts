"use server";

import { revalidatePath } from "next/cache";

const customRevalidatePath = (tag: string, type?: Parameters<typeof revalidatePath>[1]) => {
  revalidatePath(tag, type);
};

export { customRevalidatePath };
