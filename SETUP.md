# Job Portal Setup Guide

## Environment Variables Required

Create a `.env.local` file in the `web` directory with the following variables:

```bash
# Gemini API Key for AI-powered features
GEMINI_API_KEY=your_gemini_api_key_here

# Resume Parser API Key (already provided)
RESUME_PARSER_API_KEY=TS2kcQnrROBgh0emQuvKLBLZrKGaUVA4

# Optional: RapidAPI Key for job search
RAPIDAPI_KEY=your_rapidapi_key_here
```

## Getting Your Gemini API Key

1. Go to [Google AI Studio](https://aistudio.google.com/)
2. Sign in with your Google account
3. Click "Get API Key" in the left sidebar
4. Create a new API key
5. Copy the key and add it to your `.env.local` file

## Features That Require API Keys

### ✅ Resume Parser API (Working)
- **Purpose**: Extracts structured data from resume files
- **Status**: ✅ Configured and working
- **API Key**: Already provided

### ⚠️ Gemini API (Needs Setup)
- **Purpose**: AI-powered job template generation and ATS analysis
- **Status**: ⚠️ Requires API key setup
- **Fallback**: Static templates will be used if API key is not configured

### 🔧 RapidAPI (Optional)
- **Purpose**: Job search functionality
- **Status**: Optional - will show empty results if not configured

## Testing the Setup

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Upload a resume file to test the resume parser
3. Check if dynamic job templates are generated (requires Gemini API key)
4. If templates don't generate, static fallback templates will be used

## Troubleshooting

### "Empty response from Gemini" Error
- **Cause**: Gemini API key not configured or invalid
- **Solution**: Add valid GEMINI_API_KEY to .env.local file

### "Resume parser API error" 
- **Cause**: Resume parser API key issues
- **Solution**: The provided API key should work, but check for typos

### Template Generation Not Working
- **Cause**: Gemini API key missing or invalid
- **Solution**: The system will automatically fall back to static templates
