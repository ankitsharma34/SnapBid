import { auctionQueue } from "../queues/auction.queue.js";

export const auctionLifecycleJobIds = {
  start: (auctionId: string) => `auction-start-${auctionId}`,
  end: (auctionId: string) => `auction-end-${auctionId}`,
};

const lifecycleJobOptions = (jobId: string, delay: number) => ({
  jobId,
  delay,
  attempts: 3,
  backoff: {
    type: "exponential" as const,
    delay: 1000,
  },
  // Lifecycle job IDs are deterministic. Removing terminal jobs allows those
  // IDs to be reused when a scheduled auction is edited and rescheduled.
  removeOnComplete: true,
  removeOnFail: true,
});

export const scheduleAuctionEnd = async ({
  auctionId,
  endTime,
}: {
  auctionId: string;
  endTime: Date;
}) => {
  const delay = endTime.getTime() - Date.now();

  if (delay <= 0) {
    throw new Error("Auction end time must be in the future");
  }

  return auctionQueue.add(
    "END_AUCTION",
    {
      auctionId,
    },
    {
      ...lifecycleJobOptions(auctionLifecycleJobIds.end(auctionId), delay),
    },
  );
};

export const scheduleAuctionStart = async ({
  auctionId,
  startTime,
}: {
  auctionId: string;
  startTime: Date;
}) => {
  const delay = startTime.getTime() - Date.now();

  if (delay <= 0) {
    throw new Error("Auction start time must be in the future");
  }

  return auctionQueue.add(
    "START_AUCTION",
    {
      auctionId,
    },
    {
      ...lifecycleJobOptions(auctionLifecycleJobIds.start(auctionId), delay),
    },
  );
};

const removeJobIfPresent = async (jobId: string) => {
  const job = await auctionQueue.getJob(jobId);

  if (job) {
    await job.remove();
  }
};

export const removeAuctionLifecycleJobs = async (auctionId: string) => {
  await Promise.all([
    removeJobIfPresent(auctionLifecycleJobIds.start(auctionId)),
    removeJobIfPresent(auctionLifecycleJobIds.end(auctionId)),
  ]);
};

export const replaceAuctionLifecycleJobs = async ({
  auctionId,
  startTime,
  endTime,
}: {
  auctionId: string;
  startTime: Date;
  endTime: Date;
}) => {
  await removeAuctionLifecycleJobs(auctionId);

  await Promise.all([
    scheduleAuctionStart({ auctionId, startTime }),
    scheduleAuctionEnd({ auctionId, endTime }),
  ]);
};
