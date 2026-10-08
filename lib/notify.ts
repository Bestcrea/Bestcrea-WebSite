import { prisma } from "@/lib/prisma";

type NotifyInput = {
  type: string;
  title: string;
  body?: string;
  href?: string;
};

/** Notify one client (appears in the Client Portal). Never throws. */
export async function notifyClient(userId: string, input: NotifyInput) {
  try {
    await prisma.notification.create({
      data: { audience: "client", userId, ...input },
    });
  } catch (error) {
    console.error("[notify] client failed", error);
  }
}

/** Notify all staff (appears in the Admin Panel). Never throws. */
export async function notifyStaff(input: NotifyInput) {
  try {
    await prisma.notification.create({
      data: { audience: "staff", userId: null, ...input },
    });
  } catch (error) {
    console.error("[notify] staff failed", error);
  }
}
