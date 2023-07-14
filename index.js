import { Configuration, OpenAIApi } from "openai";
import express from "express";
import multer from "multer";
import path from "path";
import cors from "cors";
import fs from "fs";

const app = express();
const PORT = 4000;

app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));
app.use(express.json());
app.use(cors());

const generateID = () => Math.random().toString(36).substring(2, 10);

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "uploads");
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 },
});

const configuration = new Configuration({
    apiKey: "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",
});

const openai = new OpenAIApi(configuration);

const database = [];
const database2 = [];

const ChatGPTFunction = async (text) => {
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: text,
        temperature: 0.6,
        max_tokens: 250,
        top_p: 1,
        frequency_penalty: 1,
        presence_penalty: 1,
    });
    return response.data.choices[0].text;
};
const playgroundFunction = async (text) => {
    const response = await openai.createCompletion({
        model: "text-davinci-003",
        prompt: text,
        temperature: 0.6,
        max_tokens: 250,
        top_p: 1,
        frequency_penalty: 1,
        presence_penalty: 1,
    });
    return response.data;
};
app.post("/playground", async (req, res) => {
    try {
        const { prompt } = req.body;
        console.log(prompt);

        const result = await playgroundFunction(prompt);
        res.json({ result });
    } catch (error) {
        console.log(error.message);
        res.send(error.message);
    }
});
app.post("/image", async (req, res) => {
    try {
        const { prompt } = req.body;
        const response = await openai.createImage({
            prompt,
            n: 1,
            size: "1024x1024",
        });
        image_url = response.data.data[0].url;
        res.send(image_url);
    } catch (error) {
        console.log(error.message);
        res.send(error);
    }
});
import dotenv from 'dotenv';
dotenv.config();

// import bardBot from "bard-bot";
// const Bard = bardBot.Bard
import { Bard } from "googlebard";


let cookies = `__Secure-1PSID=${process.env.cookie}`;
let bot = new Bard(cookies);




// console.log(objective);

app.post("/resume/create", upload.single("headshotImage"), async (req, res) => {
    try {
        const {
            fullName,
            currentPosition,
            currentLength,
            currentTechnologies,
            workHistory,
        } = req.body;

        const workArray = JSON.parse(workHistory);
        const newEntry = {
            id: generateID(),
            fullName,
            image_url: `http://localhost:4000/uploads/${req.file.filename}`,
            currentPosition,
            currentLength,
            currentTechnologies,
            workHistory: workArray,
        };

        const prompt1 = `I am writing a resume, my details are \n name: ${fullName} \n role: ${currentPosition} (${currentLength} years). \n I am proficient with these tools: ${currentTechnologies}. Can you write a 100 words description for the top of the resume(first person writing)?`;

        const prompt2 = `I am writing a resume, my details are \n name: ${fullName} \n role: ${currentPosition} (${currentLength} years). \n I am proficient with these tools: ${currentTechnologies}. Can you write 10 points for a resume on what I am good at?`;



        const remainderText = () => {
            let stringText = "";
            for (let i = 0; i < workArray.length; i++) {
                stringText += ` ${workArray[i].name} as a ${workArray[i].position}.`;
            }
            return stringText;
        };

        const prompt3 = `I am writing a resume, my details are \n name: ${fullName} \n role: ${currentPosition} (${currentLength} years). \n During my years I worked at ${workArray.length
            } companies. ${remainderText()} \n Can you write me 50 words for each company seperated in numbers of my succession in the company (in first person)?`;

        // const objective = await ChatGPTFunction(prompt1);
        // const keypoints = await ChatGPTFunction(prompt2);
        // const jobResponsibilities = await ChatGPTFunction(prompt3);

        // const objective = "clean, cook, bath";


        let objective = await bot.ask(
            `I am writing a resume, my details are \n name: ${fullName} \n role: ${currentPosition} (${currentLength} years). 
    \n I am proficient with these tools: ${currentTechnologies}.
    Can you write a 100 words description for the top of the resume(first person writing)?
    following these instructions the hundred words should be put in  curly brackets`);

        const regex = /\{([^}]+)\}/;
        const match = objective.match(regex);

        if (match && match.length >= 2) {
            const extractedString = match[1];
            // console.log(extractedString);
            objective = extractedString
        } else {
            console.log("No match found.");
        }


        const keypoints = "Work in progress";
        const jobResponsibilities = "Work in progress";

        const chatgptData = { objective, keypoints, jobResponsibilities };
        const data = { ...newEntry, ...chatgptData };
        database.push(data);
        console.log(chatgptData);
        res.json({
            message: "Request successful!",
            data,
        });
    } catch (error) {
        res.json({
            message: "error",
            data: database,
        });
        console.log(error.message);
    }
});

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
