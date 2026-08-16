import { prisma } from "../../prisma/prisma.js";
import { Auction, Prisma } from "../../../generated/prisma/client.js";
import {
  CreateAuctionRepositoryInput,
  UpdateAuctionRepositoryInput,
} from "./auction.types.js";

export const findAllAuctions = async () => {
  return prisma.auction.findMany({
    select: {
      id: true,
      title: true,
      currentPrice: true,
      bidIncrement: true,
      startTime: true,
      endTime: true,
      status: true,

      auctionImages: {
        select: {
          url: true,
        },
        orderBy: {
          position: "asc",
        },
        take: 1,
      },
    },
  });
};

export type AuctionListQueryResult = Awaited<
  ReturnType<typeof findAllAuctions>
>;

export const findAuctionById = async (id: string) => {
  return prisma.auction.findUnique({
    where: { id },

    select: {
      id: true,
      title: true,
      description: true,
      startingPrice: true,
      currentPrice: true,
      bidIncrement: true,
      startTime: true,
      endTime: true,
      status: true,

      auctionImages: {
        select: {
          url: true,
          position: true,
        },
        orderBy: {
          position: "asc",
        },
      },

      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },

      seller: {
        select: {
          id: true,
          username: true,
          displayName: true,
          avatarUrl: true,
        },
      },
    },
  });
};

export type AuctionQueryResult = NonNullable<
  Awaited<ReturnType<typeof findAuctionById>>
>;

export const findCategoryIdBySlug = async (slug: string | undefined) => {
  if (!slug) {
    return null;
  }
  const category = await prisma.category.findUnique({
    where: { slug },
  });
  return category?.id || null;
};

export const createAuction = async (
  inputData: CreateAuctionRepositoryInput,
) => {
  return prisma.auction.create({
    data: {
      ...inputData,
      startingPrice: new Prisma.Decimal(inputData.startingPrice),
      currentPrice: new Prisma.Decimal(inputData.currentPrice),
      bidIncrement: new Prisma.Decimal(inputData.bidIncrement),
      auctionImages: {
        create: inputData.auctionImages.map((url: string, index: number) => ({
          url,
          position: index,
        })),
      },
    },
  });
};

export const updateAuction = async ({
  auctionId,
  input,
}: {
  auctionId: string;
  input: UpdateAuctionRepositoryInput;
}) => {
  return prisma.$transaction(async (tx) => {
    const auction = await tx.auction.update({
      where: {
        id: auctionId,
      },

      data: {
        title: input.title,
        description: input.description,
        startingPrice: new Prisma.Decimal(input.startingPrice),
        currentPrice: new Prisma.Decimal(input.currentPrice),
        bidIncrement: new Prisma.Decimal(input.bidIncrement),
        startTime: input.startTime,
        endTime: input.endTime,
        categoryId: input.categoryId,
      },
    });

    await tx.auctionImage.deleteMany({
      where: {
        auctionId,
      },
    });

    if (input.auctionImages.length > 0) {
      await tx.auctionImage.createMany({
        data: input.auctionImages.map((url, index) => ({
          auctionId,
          url,
          position: index,
        })),
      });
    }

    return auction;
  });
};
