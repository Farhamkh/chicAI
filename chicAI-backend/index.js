import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import db from "./db/connection.js";
import { clerkClient, requireAuth } from '@clerk/express'
import dotenv from "dotenv";
import suggestionsRouter from "./routes/suggestions.js";
import outfitsRouter from "./routes/outfits.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;

app.use(cors());
app.use(bodyParser.json());

const usersCollection = db.collection("users");

app.post("/register", async (req, res) => {
	const { id, email_addresses, first_name, last_name } = req.body.data;

	try {
		const existingUser = await usersCollection.findOne({ id });

		if (existingUser) {
			return res.status(200).json({ message: "User already exists." });
		}

		const newUser = {
			id,
			email_address: email_addresses?.[0]?.email_address,
			first_name,
			last_name,
			createdAt: new Date(),
		};

		const data = await usersCollection.insertOne(newUser);
		res.status(201).json({ message: "User created successfully.", newUser });
	} catch (error) {
		console.error("Error creating user:", error);
		res.status(500).json({ error: "Internal server error." });
	}
});

// Routes
app.use("/api/suggestions", suggestionsRouter);

// Use the new outfits router
app.use("/api/outfits", outfitsRouter); // Updated route


app.listen(PORT, () => {
	console.log(`Server listening on port ${PORT}`);
});