import { DepartmentCategory } from '../types/rti';

export interface ClassificationResult {
  category: DepartmentCategory;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  reasoning: string;
}

const CATEGORIES_LIST = [
  'ROADS_AND_SEWAGE', 'WATER_SUPPLY', 'ELECTRICITY', 'PUBLIC_HEALTH',
  'BUILDING_APPROVAL', 'HIGHWAYS', 'REVENUE_AND_TAX', 'EDUCATION',
  'TRANSPORT', 'CIVIL_SUPPLIES', 'HEALTHCARE', 'REGISTRATION',
  'GENERAL', 'APPEAL'
].join(', ');

const SYSTEM_PROMPT = `You are an AI classification engine for a public grievance system in Tamil Nadu.
Your job is to analyze the user's grievance (which may be in English, Tamil, or a mix of both) and output a strict JSON object.

You must classify the issue into one of these exact categories:
[${CATEGORIES_LIST}]

You must also determine the Severity level:
- HIGH: Immediate danger to life, health, or safety (e.g., open drains, live wires, disease outbreaks, no drinking water).
- MEDIUM: Significant inconvenience (e.g., potholes, delayed documents).
- LOW: General inquiries or minor issues.

Respond ONLY with a valid JSON object in this exact format:
{
  "category": "CATEGORY_NAME",
  "severity": "HIGH|MEDIUM|LOW",
  "reasoning": "A short 1-sentence explanation of why this category and severity were chosen."
}`;

/**
 * Classifies a grievance text into a Department Category and Severity Level using Groq LLM.
 */
export async function classifyGrievanceLLM(text: string): Promise<ClassificationResult> {
  const apiKey = process.env.GROQ_API_KEY_CLASSIFIER || process.env.NEXT_PUBLIC_GROQ_API_KEY_CLASSIFIER || process.env.GROQ_API_KEY;
  
  if (!apiKey) {
    console.error("GROQ_API_KEY_CLASSIFIER is not set in environment variables. Falling back to default.");
    return {
      category: 'GENERAL',
      severity: 'LOW',
      reasoning: 'API Key missing. Default fallback.'
    };
  }

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'llama3-70b-8192', // Groq's fast LLM
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: `Grievance: "${text}"` }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1 // Low temperature for deterministic classification
      })
    });

    if (!response.ok) {
      throw new Error(`Groq API returned ${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const resultText = data.choices[0].message.content;
    const parsed = JSON.parse(resultText) as ClassificationResult;
    
    // Ensure the parsed category is valid, otherwise fallback
    if (!CATEGORIES_LIST.includes(parsed.category)) {
        parsed.category = 'GENERAL';
    }

    return parsed;
  } catch (error) {
    console.error("Failed to classify grievance via LLM:", error);
    return {
      category: 'GENERAL',
      severity: 'LOW',
      reasoning: 'Classification failed due to error.'
    };
  }
}
