import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Helper function to convert file to generative part with streaming
async function fileToGenerativePart(file) {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);
  const base64 = buffer.toString("base64");

  return {
    inlineData: {
      data: base64,
      mimeType: file.type,
    },
  };
}

// Helper function to compress/optimize file if needed
async function optimizeFileIfNeeded(file) {
  // For large PDFs or images, we might want to optimize
  // For now, just pass through but this is where optimization would go
  return file;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/msword",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        {
          error:
            "Unsupported file type. Please upload PDF, DOCX, DOC, or image files.",
        },
        { status: 400 },
      );
    }

    // Validate file size (10MB limit)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: "File size exceeds 10MB limit" },
        { status: 400 },
      );
    }

    console.log(
      `Processing file: ${file.name}, size: ${file.size}, type: ${file.type}`,
    );

    // Use Gemini Pro for better PDF parsing (Flash can struggle with complex PDFs)
    const modelName =
      process.env.GEMINI_STRONG_MODEL || "gemini-1.5-pro-latest";
    console.log(`Using model: ${modelName}`);

    const model = genAI.getGenerativeModel({
      model: modelName,
      generationConfig: {
        temperature: 0.1, // Lower for more accurate extraction
        topK: 20,
        topP: 0.9,
        maxOutputTokens: 8192, // Much higher for detailed resumes
        candidateCount: 1,
      },
    });

    // Optimize file and convert to generative part in parallel
    const [optimizedFile] = await Promise.all([optimizeFileIfNeeded(file)]);

    console.log("Converting file to base64...");
    const filePart = await fileToGenerativePart(optimizedFile);
    console.log("File converted successfully");

    // More detailed prompt for better extraction
    const prompt = `You are a professional resume parser. Analyze this resume document and extract all information into a JSON object.

IMPORTANT: Respond with ONLY valid JSON. No explanatory text, no markdown formatting, just the JSON object.

Required JSON structure:
{
  "name": "Full name from resume",
  "email": "Email address",
  "phone": "Phone number",
  "location": "Location/City",
  "linkedin": "LinkedIn URL if present, otherwise null",
  "github": "GitHub URL if present, otherwise null",
  "website": "Website URL if present, otherwise null",
  "summary": "Professional summary or objective",
  "skills": ["skill1", "skill2", "skill3"],
  "experience": [
    {
      "title": "Job title",
      "organization": "Company name",
      "location": "Job location",
      "dates": "Employment dates",
      "description": "Job responsibilities and achievements"
    }
  ],
  "education": [
    {
      "degree": "Degree name",
      "field": "Field of study",
      "institution": "University/School name",
      "location": "School location",
      "dates": "Dates attended",
      "gpa": "GPA if mentioned, otherwise null"
    }
  ],
  "certifications": ["cert1", "cert2"],
  "projects": [
    {
      "name": "Project name",
      "description": "Project description",
      "technologies": ["tech1", "tech2"],
      "link": "Project URL if available, otherwise null"
    }
  ],
  "languages": ["language1", "language2"],
  "awards": ["award1", "award2"]
}

Extract all available information from the resume. Use null for missing single values, [] for missing arrays.`;

    console.log("Sending request to Gemini API...");

    // Generate content with extended timeout for complex PDFs (Pro model is slower but more accurate)
    const result = await Promise.race([
      model.generateContent([prompt, filePart]),
      new Promise((_, reject) =>
        setTimeout(
          () => reject(new Error("Parsing timeout - file too complex")),
          90000, // 90 seconds for complex PDFs
        ),
      ),
    ]);

    // Check if response exists and has content
    if (!result || !result.response) {
      console.error("Empty response from Gemini API");
      return NextResponse.json(
        {
          success: false,
          error: "Empty response from AI - file may be corrupted or unreadable",
        },
        { status: 500 },
      );
    }

    const responseText = result.response.text();

    // Check if response text is empty
    if (!responseText || responseText.trim().length === 0) {
      console.error("Gemini returned empty text response");
      return NextResponse.json(
        {
          success: false,
          error:
            "AI could not extract text from the file - try a different format or clearer scan",
        },
        { status: 500 },
      );
    }

    console.log("Gemini response length:", responseText.length);
    console.log("First 200 chars:", responseText.substring(0, 200));

    // Parse JSON response
    let parsedData;
    try {
      // Clean the response - remove markdown code blocks if present
      const cleanedText = responseText
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();

      // If still empty after cleaning
      if (!cleanedText) {
        throw new Error("Empty response after cleaning");
      }

      parsedData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error("Failed to parse Gemini response:", parseError.message);
      console.error("Response text:", responseText.substring(0, 500));

      // Try to extract any structured data even if JSON parsing fails
      // Return a fallback with raw text
      return NextResponse.json(
        {
          success: false,
          error:
            "Could not parse AI response - the file may contain non-standard formatting",
          rawResponse: responseText.substring(0, 1000),
          parseError: parseError.message,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      data: parsedData,
      message: "Resume parsed successfully",
    });
  } catch (error) {
    console.error("Gemini parse error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to parse resume",
        details: error.message,
      },
      { status: 500 },
    );
  }
}

// Increase body size limit for file uploads
export const config = {
  api: {
    bodyParser: {
      sizeLimit: "10mb",
    },
  },
};
