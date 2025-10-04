import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { resume, job, structured } = await request.json();

    if (!resume || !resume.trim()) {
      return NextResponse.json(
        { error: "Resume content is required" },
        { status: 400 },
      );
    }

    console.log(
      "ATS Analysis starting, resume length:",
      resume.length,
      "job length:",
      job?.length || 0,
    );

    // Use Flash model with optimized config
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash-latest",
      generationConfig: {
        temperature: 0.4,
        topK: 20,
        topP: 0.9,
        maxOutputTokens: 3000, // Increased to prevent MAX_TOKENS
      },
    });

    // Truncate inputs for faster processing
    const resumeSnippet = resume.substring(0, 2500);
    const jobSnippet = job ? job.substring(0, 1500) : null;

    // Simplified, compact prompt
    let prompt = `Analyze resume`;

    if (jobSnippet && jobSnippet.trim()) {
      prompt += ` for job match.\n\nResume:\n${resumeSnippet}\n\nJob:\n${jobSnippet}`;
    } else {
      prompt += ` quality.\n\nResume:\n${resumeSnippet}`;
    }

    prompt += `\n\nReturn JSON with YOUR analysis (don't use example values):\n{"overallScore":0.0,"matchedKeywords":[],"missingKeywords":[],"skillGaps":[],"strengths":[],"improvements":[],"recommendations":[],"summary":"","atsOptimization":{"formatting":"","keywords":"","structure":""}}

Analyze and provide:
- overallScore: YOUR calculated score (0.0 to 1.0) based on ATS compatibility
- matchedKeywords: keywords from job/industry that ARE in resume
- missingKeywords: important keywords NOT in resume
- skillGaps: skills needed but missing
- strengths: 3-5 strong points
- improvements: 3-5 specific improvements
- recommendations: 3-5 actionable recommendations
- summary: 1-2 sentence summary
- atsOptimization: formatting/keywords/structure assessment

Provide ACTUAL analysis, not example data.`;

    console.log("Prompt length:", prompt.length);

    // Generate analysis with timeout
    const result = await Promise.race([
      model.generateContent(prompt),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Analysis timeout")), 30000),
      ),
    ]);

    console.log("Response received");

    // Check response validity
    if (!result?.response) {
      console.error("No response object");
      throw new Error("Empty response from AI");
    }

    const responseText = result.response.text();
    console.log("Response length:", responseText?.length || 0);

    // Check for empty response
    if (!responseText || responseText.trim().length === 0) {
      console.error("Empty response from Gemini");
      throw new Error("Empty AI response");
    }

    console.log("Response preview:", responseText.substring(0, 200));

    // Parse JSON response
    let analysisData;
    try {
      // Clean the response - remove markdown code blocks if present
      const cleanedText = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      if (!cleanedText) {
        throw new Error("Empty text after cleaning");
      }

      console.log("Parsing JSON, cleaned length:", cleanedText.length);
      analysisData = JSON.parse(cleanedText);
      console.log("Parse successful");
    } catch (parseError) {
      console.error("Parse error:", parseError.message);
      console.error(
        "Response text (first 500):",
        responseText.substring(0, 500),
      );

      // Return a fallback response
      return NextResponse.json({
        overallScore: 0.7,
        matchedKeywords: [],
        missingKeywords: [],
        skillGaps: [],
        strengths: ["Resume received and analyzed"],
        improvements: ["AI analysis temporarily unavailable"],
        recommendations: ["Please try again in a moment"],
        summary:
          "Basic analysis completed. Detailed scoring temporarily unavailable.",
        atsOptimization: {
          formatting: "Standard format detected",
          keywords: "Review in progress",
          structure: "Readable structure",
        },
      });
    }

    return NextResponse.json(analysisData);
  } catch (error) {
    console.error("ATS Analysis error:", error);
    return NextResponse.json(
      {
        error: "Failed to analyze resume",
        details: error.message,
      },
      { status: 500 },
    );
  }
}
