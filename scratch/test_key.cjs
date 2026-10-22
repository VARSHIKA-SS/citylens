const { GoogleGenAI } = require("@google/genai");

async function test() {
  const ai = new GoogleGenAI({
    apiKey: "AIzaSyB2IRPeMIS6y4.0.96zcSi4d-eHoidSSVXog"
  });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: "Say hello",
    });
    console.log("Success:", response.text);
  } catch (e) {
    console.error("Failed:", e.message);
  }
}

test();
