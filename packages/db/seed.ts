import { PrismaClient } from "@prisma/client";
import { prismaClient } from "./src";

import 'dotenv/config'

const USER_ID = "1";

async function seed() {
    await prismaClient.user.create({
        data: {
            id: USER_ID,
            email: "example@example.com",
            password: "test"
        }
    })

    const website = await prismaClient.website.create({
        data: {
            id: "2",
            url: "https://test.com",
            userID: USER_ID
        }
    })

    const validator = await prismaClient.validator.create({
        data: {
          id: "3",
          publicKey: "some_public_key",
          location: "USA",
          ip: "192.168.1.1",
        },
      });

    await prismaClient.websiteTick.create({
        data:{
            websiteID: website.id,
            validatorID: validator.id,
            status: "UP",
            createdAt: new Date(Date.now()).toISOString(),
            latency: 100
        }
    })
    await prismaClient.websiteTick.create({
        data:{
            websiteID: website.id,
            validatorID: validator.id,
            status: "UP",
            createdAt: new Date(Date.now() - 1000*60*10).toISOString(),
            latency: 100
        }
    })


    await prismaClient.websiteTick.create({
        data:{
            websiteID: website.id,
            validatorID: validator.id,
            status: "DOWN",
            createdAt: new Date(Date.now() - 1000*60*20).toISOString(),
            latency: 100
        }
    })
}

seed();