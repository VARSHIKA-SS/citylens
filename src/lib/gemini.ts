import { Capacitor } from '@capacitor/core';
import { CityIntelligence } from "../types";

// FOR MOBILE DEBUGGING:
// 1. You MUST use your computer's REAL local IP address, not localhost.
// 2. Your phone and computer MUST be on the same Wi-Fi.
// 3. Ensure your server is running (npm run dev).
export const SERVER_URL = Capacitor.isNativePlatform() ? "http://172.17.35.11:3000" : "";
export const API_BASE = `${SERVER_URL}/api`;

export async function getCityIntelligence(city: string, userProfile: { name: string, gender: string }): Promise<CityIntelligence> {
  try {
    const response = await fetch(`${API_BASE}/intelligence`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, userProfile }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Authentication or Server Error");
    }

    return await response.json();
  } catch (e) {
    console.error("Gemini Execution Error", e);
    // This error usually means the mobile app cannot reach your computer's IP
    throw new Error("Cannot connect to AI Server. Check if your phone is on the same Wi-Fi as your PC and the IP " + API_BASE + " is correct.");
  }
}

export async function searchSpecificIntelligence(city: string, query: string, userProfile: { name: string, gender: string }): Promise<any> {
  try {
    const response = await fetch(`${API_BASE}/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, query, userProfile }),
    });

    if (!response.ok) return [];
    return await response.json();
  } catch (e) {
    console.error("Gemini Search Error", e);
    return [];
  }
}

export async function chatWithGuide(message: string, context: CityIntelligence | null, userProfile: { name: string, gender: string }): Promise<string> {
  try {
    const response = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        city: context?.city || "India",
        userProfile
      }),
    });

    if (!response.ok) return "The guide is currently unresponsive.";

    const data = await response.json();
    return data.reply || "I'm sorry, I couldn't process that.";
  } catch (e) {
    console.error("Gemini Chat Error", e);
    return "Connection to guide lost. Please try again.";
  }
}
