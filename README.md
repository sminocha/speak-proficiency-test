# Speak Proficiency Assessment Prototype

A functional, interactive language proficiency exam prototype that demonstrates a slice of what Speak might sell to employers for grading employee English proficiency.

## Features

### 🎯 Examinee Welcome Page
- Professional welcome interface with personalized greeting
- System check simulation (microphone and camera detection)
- Clean, intuitive design with clear call-to-action

### 📝 Interactive Assessment Module
Four different question types to test various English proficiency skills:

1. **Email Response (Writing)**
   - Professional email composition task
   - Tests business writing, tone, and clarity
   - 150-200 word target length

2. **Summarize Text (Reading & Writing)**
   - Article comprehension and summarization
   - Tests reading comprehension and synthesis skills
   - 3-4 sentence summary requirement

3. **Dictation (Listening & Typing)**
   - Audio playback with text-to-speech
   - Tests listening accuracy for professional vocabulary
   - Exact transcription required

4. **Spoken Response (Speaking - Simulation)**
   - 30-second recording simulation
   - Tests coherent, structured spoken communication
   - Interview scenario-based prompts

### 🤖 AI Grading System
- Structured rubric with four criteria:
  - **Fluency & Cohesion**: Structure and flow assessment
  - **Lexical Resource**: Vocabulary precision and variety
  - **Grammatical Range & Accuracy**: Grammar command evaluation
  - **Task Achievement**: Prompt fulfillment analysis
- 1-5 scoring scale for each criterion
- Contextual feedback generation
- JSON-formatted results

## Technology Stack

- **Framework**: Next.js 15 with TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Audio**: Web Speech API (text-to-speech)
- **API**: Next.js API Routes

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run the development server**:
   ```bash
   npm run dev
   ```

3. **Open your browser**:
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
src/
├── app/
│   ├── api/grade/          # AI grading API endpoint
│   ├── layout.tsx          # Root layout
│   └── page.tsx           # Main application entry
├── components/
│   ├── WelcomePage.tsx    # Examinee welcome interface
│   └── AssessmentModule.tsx # Interactive test component
└── globals.css            # Global styles
```

## Usage Flow

1. **Welcome Page**: Employee sees personalized welcome with system checks
2. **Question Selection**: Choose from four different question types
3. **Response Input**: Complete the selected assessment task
4. **AI Grading**: Submit for instant feedback and scoring
5. **Results Review**: View detailed rubric scores and feedback

## Future Enhancements

- Integration with Vercel AI SDK for production LLM calls
- Real speech-to-text for spoken responses
- User authentication and session management
- Employer dashboard for test creation and results
- Advanced analytics and reporting
- Multi-language support

## API Integration

The grading system is designed to easily integrate with production LLM APIs. The current implementation includes:

- Structured prompt engineering for consistent evaluation
- Fallback mechanisms for API failures
- Extensible rubric system
- JSON response formatting

To integrate with a production LLM service, update the `/api/grade` endpoint with your preferred AI service (OpenAI, Anthropic, etc.).

## License

This is a prototype project for demonstration purposes.