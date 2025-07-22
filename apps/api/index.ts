import express from "express"
import { authMiddleware } from "./middleware"
import { prismaClient } from "db/client"
import cors from "cors";
import type { AuthenticatedRequest } from "./types";
import { Transaction, SystemProgram, Connection } from "@solana/web3.js";
import { Keypair } from "@solana/web3.js";
import * as bs58 from 'bs58';

const connection = new Connection("https://api.mainnet-beta.solana.com");

const app = express()
app.use(cors())
app.use(express.json())
app.use(authMiddleware as express.RequestHandler)  

app.post("/app/v1/website", async (req: AuthenticatedRequest, res) => {
    const userID = req.userID!; // This is the userID that we set in the authMiddleware. The ! is to make sure that the userID is not null.
    const {url} = req.body; //This is destructuring the body of the request. alt : const url = req.body.url;

    const data = await prismaClient.website.create({
        data: {
            userID: userID,
            url
        }
    })

    res.json({
        message: "Website created",
        id: data.id, // This is the id of the website that we created, which is the primary key of the website table.
    })
} )

//Return the ticks/status of the website
//Assuming that the user logs in passing an arg to the url like this: /app/v1/website/status?websiteID=1
//We can also pass the websiteID as a path parameter like this: /app/v1/website/status/1
app.get("/app/v1/website/status", async (req: AuthenticatedRequest, res) => {
    const websiteID = req.query.websiteID as unknown as string; //This is destructuring the query string of the request. alt : const websiteID = req.query.websiteID;
    const userID = req.userID!;

    //We are restricting the user to only see the websites that they created.
    //We are doing this by checking if the userID of the website that they are trying to access is the same as the userID of the user that is logged in.

    const data = await prismaClient.website.findFirst({
        where: {
            id: websiteID,
            userID,
            disabled: false
        }, 
        include: {
            ticks: true, 
        }
    })

    res.json(data)
} )

//Return the list of websites
app.get("/app/v1/websites", async (req: AuthenticatedRequest, res) => {
    const userID = req.userID!;
    try {
        const websites = await prismaClient.website.findMany({
            where: {
                userID,
                disabled: false
            },
            include: {
                ticks: true
            }
        })
        res.json(websites)
    }
    catch (e) {
        console.log(e)
        res.status(500).json({
            message: "Database error",
        })
    }

})

//Delete the tracking of the website
app.delete("/app/v1/website/", async (req: AuthenticatedRequest, res) => {
    const websiteID = req.query.websiteID;
    const userID = req.userID!;

    await prismaClient.website.update({
        where: {
            id: websiteID as string,
            userID
        }, 
        data: {
            disabled: true,  
        }
    })

    res.json({
        message: "Website deleted",
    })
} )

app.post("/api/v1/payout/:validatorId", async (req, res) => {
   const validatorId = req.params.validatorId;
   const userID = req.userID!;
   try {
    const validator = await prismaClient.validator.findFirst({
        where: {
            id: validatorId,
        }
    })

    if (!validator) {
        return res.status(404).json({ message: "Validator not found" });
    }

    const payerKeypair = Keypair.fromSecretKey(bs58.default.decode(process.env.PRIVATE_KEY as string));

    const transaction = new Transaction();
    transaction.add(
        SystemProgram.transfer({
            fromPubkey: payerKeypair.publicKey,
            toPubkey: validator.publicKey,
            lamports: validator.pendingPayouts,
        })
    );
    
    const data = await prismaClient.validator.update({
        where : {
            id: validatorId,
        },
        data: {
            pendingPayouts: 0,
        }
    })
})

app.listen(8080);

app.get("/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

app.get("/debug/db", async (req, res) => {
    try {
      const users = await prismaClient.user.findMany();
      const websites = await prismaClient.website.findMany();
      const validators = await prismaClient.validator.findMany();
      const ticks = await prismaClient.websiteTick.findMany();
      
      res.json({
        users: users.length,
        websites: websites.length,
        validators: validators.length,
        ticks: ticks.length,
        data: {
          users,
          websites,
          validators,
          ticks: ticks.map(t => ({
            ...t,
            createdAt: t.createdAt.toISOString()
          }))
        }
      });
    } catch (e) {
      console.error("Debug DB error:", e);
      res.status(500).json({ error: "Failed to query database" });
    }
  });

const PORT = 8080;
app.listen(PORT, () => {
    console.log(`API server running on http://localhost:${PORT}`);
  });
