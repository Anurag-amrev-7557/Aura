import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to retry with exponential backoff
async function retryWithBackoff(fn, maxRetries = 2, baseDelay = 500) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      const isLastRetry = i === maxRetries - 1;
      const isRetryable =
        error.status === 503 ||
        error.status === 429 ||
        error.message?.includes("overloaded") ||
        error.message?.includes("unavailable");

      if (!isRetryable || isLastRetry) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, i);
      console.log(
        `Retry ${i + 1}/${maxRetries} after ${delay}ms due to: ${error.message}`,
      );
      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }
}

// Generate smart fallback templates based on resume content
function generateSmartFallback(resumeContent) {
  const resumeLower = resumeContent.toLowerCase();
  const skills = [];
  const industries = [];

  // Detect skills and industries
  if (
    resumeLower.includes("javascript") ||
    resumeLower.includes("react") ||
    resumeLower.includes("node")
  ) {
    skills.push("JavaScript", "Web Development", "React");
  }
  if (
    resumeLower.includes("python") ||
    resumeLower.includes("django") ||
    resumeLower.includes("flask")
  ) {
    skills.push("Python", "Backend Development");
  }
  if (resumeLower.includes("java") || resumeLower.includes("spring")) {
    skills.push("Java", "Enterprise Development");
  }
  if (
    resumeLower.includes("data") ||
    resumeLower.includes("analytics") ||
    resumeLower.includes("sql")
  ) {
    skills.push("Data Analysis", "SQL");
  }
  if (
    resumeLower.includes("devops") ||
    resumeLower.includes("aws") ||
    resumeLower.includes("docker")
  ) {
    skills.push("DevOps", "Cloud", "AWS");
  }

  // Default skills if none detected
  if (skills.length === 0) {
    skills.push("Problem Solving", "Communication", "Teamwork");
  }

  return [
    {
      name: skills.includes("JavaScript")
        ? "Frontend Developer"
        : "Software Engineer",
      text: "Join our team to build innovative solutions. Work with modern technologies, collaborate with talented engineers, and create impactful products. We value clean code, best practices, and continuous learning.",
      matchReason: "Based on your technical skills and experience",
      keySkills: skills.slice(0, 3),
      experienceLevel: "Mid",
      industry: "Technology",
    },
    {
      name: skills.includes("Python")
        ? "Backend Engineer"
        : "Full Stack Developer",
      text: "We're looking for someone to develop scalable applications. Build features, optimize performance, and work on challenging problems. Strong technical foundation and teamwork skills required.",
      matchReason: "Matches your development background",
      keySkills: skills.length > 3 ? skills.slice(1, 4) : skills.slice(0, 3),
      experienceLevel: "Mid",
      industry: "Technology",
    },
    {
      name: skills.includes("Data Analysis")
        ? "Data Analyst"
        : "Software Developer",
      text: "Contribute to exciting projects in a collaborative environment. Design solutions, write quality code, and grow your technical expertise. We offer mentorship and career development opportunities.",
      matchReason: "Aligned with your skill set",
      keySkills: skills.length > 6 ? skills.slice(3, 6) : skills.slice(0, 3),
      experienceLevel: "Mid",
      industry: "Technology",
    },
  ];
}

export async function POST(request) {
  try {
    const { resumeContent } = await request.json();

    if (!resumeContent || !resumeContent.trim()) {
      return NextResponse.json(
        { error: "Resume content is required" },
        { status: 400 },
      );
    }

    console.log(
      "Template generation started, resume length:",
      resumeContent.length,
    );

    // Use Flash model for fast template generation
    const model = genAI.getGenerativeModel({
      model: process.env.GEMINI_MODEL || "gemini-1.5-flash-latest",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.9,
        maxOutputTokens: 2048, // Increased significantly to prevent MAX_TOKENS
      },
    });

    // Compact prompt to reduce input token usage
    const prompt = `Generate 3 job role suggestions for this resume.

Resume summary:
${resumeContent.substring(0, 400)}

Return JSON only:
{"templates":[{"name":"Title","text":"50-word description","matchReason":"why","keySkills":["skill1","skill2"],"experienceLevel":"Mid","industry":"Tech"}]}

Generate 3 different roles.`;

    console.log("Calling Gemini API with prompt length:", prompt.length);

    let result;
    try {
      result = await retryWithBackoff(async () => {
        return await Promise.race([
          model.generateContent(prompt),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error("Generation timeout")), 20000),
          ),
        ]);
      });
    } catch (error) {
      console.error("Template generation failed:", error.message);
      console.log("Using smart fallback templates");
      return NextResponse.json({
        templates: generateSmartFallback(resumeContent),
      });
    }

    // Check for blocked responses or safety filters
    if (result.response.promptFeedback?.blockReason) {
      console.error(
        "Response blocked:",
        result.response.promptFeedback.blockReason,
      );
      return NextResponse.json({
        templates: generateSmartFallback(resumeContent),
      });
    }

    // Check if candidates exist
    if (
      !result.response.candidates ||
      result.response.candidates.length === 0
    ) {
      console.error("No candidates in response");
      return NextResponse.json({
        templates: generateSmartFallback(resumeContent),
      });
    }

    // Debug candidate details
    const candidate = result.response.candidates[0];
    console.log("Finish reason:", candidate.finishReason);
    console.log(
      "Safety ratings:",
      JSON.stringify(candidate.safetyRatings || []),
    );
    console.log("Content parts count:", candidate.content?.parts?.length || 0);

    let responseText;
    try {
      responseText = result.response.text();
    } catch (textError) {
      console.error("Error getting text from response:", textError.message);
      console.log(
        "Candidate dump:",
        JSON.stringify(candidate).substring(0, 300),
      );
      return NextResponse.json({
        templates: generateSmartFallback(resumeContent),
      });
    }

    console.log("Gemini response received, length:", responseText?.length || 0);

    if (!responseText || responseText.length === 0) {
      console.error("EMPTY RESPONSE - Debug info:");
      console.log("Finish reason:", candidate.finishReason);
      console.log(
        "Full candidate:",
        JSON.stringify(candidate).substring(0, 500),
      );
    }

    // Parse JSON response
    let templatesData;
    try {
      const cleanedText = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      templatesData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse response, using fallback");
      return NextResponse.json({
        templates: generateSmartFallback(resumeContent),
      });
    }

    // Validate templates structure
    if (
      !templatesData.templates ||
      !Array.isArray(templatesData.templates) ||
      templatesData.templates.length === 0
    ) {
      console.log("Invalid template structure, using fallback");
      return NextResponse.json({
        templates: generateSmartFallback(resumeContent),
      });
    }

    console.log(
      "Templates generated successfully:",
      templatesData.templates.length,
    );
    return NextResponse.json(templatesData);
  } catch (error) {
    console.error("Template generation error:", error);
    return NextResponse.json({
      templates: generateSmartFallback(""),
    });
  }
}
