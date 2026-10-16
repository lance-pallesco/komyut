require("dotenv").config();
const https = require("https");
const { URL } = require("url");

const API_KEY = process.env.OPENAI_API_KEY;
const BASE_URL = process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1";
const CHAT_MODEL = process.env.OPENAI_MODEL || "openai/gpt-4.1-mini";
const EMBED_MODEL = process.env.OPENAI_EMBEDDING_MODEL || "openai/text-embedding-3-small";

console.log("========================================");
console.log("  Testing OpenRouter Endpoints");
console.log("========================================");
console.log("Base URL:        ", BASE_URL);
console.log("Chat Model:      ", CHAT_MODEL);
console.log("Embedding Model: ", EMBED_MODEL);
console.log("API Key:         ", API_KEY ? API_KEY.slice(0, 16) + "..." : "MISSING", "\n");

function makeRequest(path, payload) {
  return new Promise((resolve) => {
    const fullUrl = new URL(BASE_URL + path);
    const dataString = JSON.stringify(payload);

    const options = {
      hostname: fullUrl.hostname,
      port: 443,
      path: fullUrl.pathname,
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${API_KEY}`,
        "HTTP-Referer": "http://localhost:3000",
        "X-Title": "KOMYUT",
        "Content-Length": Buffer.byteLength(dataString),
      },
      timeout: 15000,
    };

    const startTime = Date.now();
    const req = https.request(options, (res) => {
      let body = "";
      res.on("data", (chunk) => (body += chunk));
      res.on("end", () => {
        const duration = Date.now() - startTime;
        resolve({
          status: res.statusCode,
          statusMessage: res.statusMessage,
          headers: res.headers,
          duration,
          body,
        });
      });
    });

    req.on("error", (e) => {
      resolve({
        error: e.message,
        duration: Date.now() - startTime,
      });
    });

    req.on("timeout", () => {
      req.destroy();
      resolve({
        error: "Request timed out after 15s",
        duration: Date.now() - startTime,
      });
    });

    req.write(dataString);
    req.end();
  });
}

async function runTests() {
  // Test 1: Chat Completion
  console.log("----------------------------------------");
  console.log(`1. Testing Chat Completion (${CHAT_MODEL})...`);
  console.log("----------------------------------------");
  const chatResult = await makeRequest("/chat/completions", {
    model: CHAT_MODEL,
    messages: [{ role: "user", content: "Hello! Reply with 'OK'." }],
    max_tokens: 10,
  });

  console.log(`Status: ${chatResult.status || "ERR"} (${chatResult.duration}ms)`);
  if (chatResult.status === 200) {
    try {
      const parsed = JSON.parse(chatResult.body);
      console.log("Response:", parsed.choices?.[0]?.message?.content);
      console.log("✅ Chat Completion is WORKING!");
    } catch {
      console.log("Raw body:", chatResult.body.slice(0, 300));
    }
  } else {
    console.log("Error details:", chatResult.body ? chatResult.body.slice(0, 400) : chatResult.error);
    console.log("❌ Chat Completion FAILED");
  }

  // Test 2: Embeddings
  console.log("\n----------------------------------------");
  console.log(`2. Testing Embeddings (${EMBED_MODEL})...`);
  console.log("----------------------------------------");
  const embedResult = await makeRequest("/embeddings", {
    model: EMBED_MODEL,
    input: "Route from SM North EDSA to BGC High Street",
  });

  console.log(`Status: ${embedResult.status || "ERR"} (${embedResult.duration}ms)`);
  if (embedResult.status === 200) {
    try {
      const parsed = JSON.parse(embedResult.body);
      console.log(`Embedding dimensions: ${parsed.data?.[0]?.embedding?.length}`);
      console.log("✅ Embeddings are WORKING!");
    } catch {
      console.log("Raw body:", embedResult.body.slice(0, 300));
    }
  } else {
    console.log("Error details:", embedResult.body ? embedResult.body.slice(0, 400) : embedResult.error);
    console.log("❌ Embeddings FAILED");
  }

  console.log("========================================\n");
}

runTests();
