import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

// Initialize Gemini SDK with User-Agent for telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    }
  }
});

app.use(express.json());

// API Endpoints
// Triage endpoint: takes a list of user tasks or a raw text description, then prioritizes and generates a plan
app.post("/api/panic/triage", async (req, res) => {
  try {
    const { dump, currentBacklog = [] } = req.body;

    if (!dump || typeof dump !== "string" || dump.trim() === "") {
      return res.status(400).json({ error: "Panic dump cannot be empty." });
    }

    const systemPrompt = `You are the core intelligence of Panicmode.ai, a proactive, non-judgmental, highly structured AI productivity companion.
Your mission is to rescue users who are overwhelmed, facing imminent deadlines, or suffering from task paralysis.
We have a strict "Do This Now" rule:
1. Validate the user's feelings and situation in exactly one warm, motivating, non-judgmental sentence (the "assessment").
2. Choose the single most critical task they must focus on right now (the "target"). Prioritize based on:
   - High impact of completion / penalty of failure (e.g. paying electric bill, emailing boss, homework due in 2 hours).
   - Low cognitive barrier (do high-urgency, short-duration tasks first to gain momentum).
3. Break this highest-priority target task down into 2-3 hyper-specific, actionable micro-steps. (e.g., "Open a document and write 3 bullet points. You have 10 minutes.").
4. Provide a friction-reducing helper draft or tool if helpful (e.g., a complete draft email, a starting template, standard links/search queries, or specific schedule proposal).
5. Put all other tasks in the "backlog" list so the user doesn't have to look at them right now. Estimate completing times and levels of urgency for each.
6. Design a custom "handoffMessage" to serve as a supportive accountability partner.

Analyze the user's panic dump:
"${dump}"

Also look at any pre-existing backlog items they have:
${JSON.stringify(currentBacklog)}

Return a strict JSON object structure representing this plan.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["assessment", "target", "backlog", "handoffMessage"],
          properties: {
            assessment: {
              type: Type.STRING,
              description: "A 1-sentence validation of the workload. Non-judgmental and validating.",
            },
            target: {
              type: Type.OBJECT,
              description: "The single most critical task they must focus on right now.",
              required: ["title", "originalTask", "urgencyReason", "microSteps", "helperDraft"],
              properties: {
                title: {
                  type: Type.STRING,
                  description: "A short, humbler, literal name for the primary target task (e.g., 'Pay Electricity Bill' or 'Draft Intro paragraph').",
                },
                originalTask: {
                  type: Type.STRING,
                  description: "The original task text from the user's dump that this target corresponds to.",
                },
                urgencyReason: {
                  type: Type.STRING,
                  description: "A brief, clear explanation of why we are doing this first.",
                },
                microSteps: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: "2-3 hyper-specific, bite-sized immediate action items (e.g., 'Open Google Docs', 'Write 1 sentence').",
                },
                helperDraft: {
                  type: Type.STRING,
                  description: "A friction-reducing helper (e.g., a drafted email, study schedule, list of resources, or starting prompt). Null if not applicable.",
                },
              },
            },
            backlog: {
              type: Type.ARRAY,
              description: "The list of other tasks to keep hidden or do next.",
              items: {
                type: Type.OBJECT,
                required: ["id", "title", "originalTask", "estimatedMinutes", "urgency"],
                properties: {
                  id: { type: Type.STRING, description: "A unique short string id (e.g., task_1)" },
                  title: { type: Type.STRING, description: "A clean, literal name of the task." },
                  originalTask: { type: Type.STRING, description: "The original task description." },
                  estimatedMinutes: { type: Type.INTEGER, description: "Estimated minutes to complete." },
                  urgency: { type: Type.STRING, description: "High, Medium, or Low" },
                },
              },
            },
            handoffMessage: {
              type: Type.STRING,
              description: "A clear accountability prompt demanding user confirmation once a step is done.",
            },
          },
        },
      },
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Triage API error:", error);
    res.status(500).json({ error: error.message || "An error occurred during triage." });
  }
});

// Stuck endpoint: helps when a user hits a block on their current micro-step
app.post("/api/panic/stuck", async (req, res) => {
  try {
    const { targetTask, currentStep, blockReason } = req.body;

    if (!targetTask || !currentStep) {
      return res.status(400).json({ error: "Missing active task or active step info." });
    }

    const systemPrompt = `The user is using Panicmode.ai and is paralyzed/stuck on a micro-step.
Active Task: "${targetTask}"
Current Micro-Step: "${currentStep}"
User's Block/Feeling: "${blockReason || "Just paralyzed / unable to start"}"

Your goal is to decrease friction to absolute zero. Break this micro-step down into an even smaller, laughably easy, low-friction action.
Provide a warm, supportive piece of motivation, and if helpful, a precise starter payload (e.g., a fill-in-the-blank text, a link search query, or a single sentence they can copy-paste).

Return a strict JSON object.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          required: ["simplerStep", "motivation", "helperDraft"],
          properties: {
            simplerStep: {
              type: Type.STRING,
              description: "An even simpler, laughably easy action that can be done in 30 seconds (e.g., 'Double-click your browser icon' or 'Write just your name on the paper').",
            },
            motivation: {
              type: Type.STRING,
              description: "Short, empathetic, energizing words of motivation (1-2 sentences).",
            },
            helperDraft: {
              type: Type.STRING,
              description: "A direct prompt, sentence template, or tool starting payload. Null if not applicable.",
            },
          },
        },
      },
    });

    const resultText = response.text || "{}";
    res.json(JSON.parse(resultText));
  } catch (error: any) {
    console.error("Stuck API error:", error);
    res.status(500).json({ error: error.message || "An error occurred while resolving the block." });
  }
});

// Chat companion endpoint: general chat support or task updating
app.post("/api/panic/chat", async (req, res) => {
  try {
    const { messages, currentTarget, backlog } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: "Messages array is required." });
    }

    const conversationHistory = messages.map(msg => `${msg.role === "user" ? "User" : "Panicmode.ai"}: ${msg.content}`).join("\n");

    const systemPrompt = `You are Panicmode.ai, a proactive, empathetic, and highly structured AI productivity companion.
Your style is reassuring, non-judgmental, but laser-focused on momentum and getting things done.
The user is currently tackling this critical Target task: "${currentTarget || "None selected yet"}"
The remaining task backlog is: ${JSON.stringify(backlog || [])}

Conversation History so far:
${conversationHistory}

Respond to the user's latest message. Keep it short (2-4 sentences max), highly supportive, and focused on helping them finish their active target task. If they request a specific asset (like drafting an email, writing a summary, outlining a plan, proposing a schedule, or suggesting a time), provide it directly with high quality. Always keep friction minimal.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: systemPrompt,
    });

    res.json({ reply: response.text });
  } catch (error: any) {
    console.error("Chat API error:", error);
    res.status(500).json({ error: error.message || "An error occurred during communication." });
  }
});

// Serve frontend
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Panicmode.ai server running on http://localhost:${PORT}`);
  });
}

startServer();
