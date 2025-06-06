import OpenAI from 'openai';
import { Control } from '../types/controls';
import { NLPProcessingOptions } from '../types/nlp';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function processControlsWithAI(
  controls: Control[],
  options: NLPProcessingOptions
): Promise<Control[]> {
  try {
    // Prepare the prompt for OpenAI
    const prompt = `Analyze and deduplicate the following security and compliance controls. 
    For each control, consider:
    1. Semantic similarity
    2. Framework requirements
    3. Priority levels
    4. Technical implementation details

    Controls to analyze:
    ${JSON.stringify(controls, null, 2)}

    Requirements:
    - Similarity threshold: ${options.similarityThreshold}
    - Merge strategy: ${options.mergeStrategy}
    - Preserve frameworks: ${options.preserveFrameworks}

    Return a JSON array of deduplicated controls, maintaining the same structure but with merged similar controls.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a security and compliance expert. Your task is to analyze and deduplicate security controls while preserving their essential requirements and framework-specific details."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3, // Lower temperature for more consistent results
    });

    const response = JSON.parse(completion.choices[0].message.content || '{}');
    return response.processedControls || controls;
  } catch (error) {
    console.error('Error processing controls with AI:', error);
    throw error;
  }
}

// Helper function to generate enhanced descriptions
export async function enhanceControlDescription(control: Control): Promise<string> {
  try {
    const prompt = `Enhance the following security control description to be more detailed and actionable:
    Control: ${control.text}
    Current Description: ${control.description}
    Framework: ${control.frameworks.join(', ')}
    Category: ${control.category}

    Provide a more detailed description that includes:
    1. Specific implementation steps
    2. Technical requirements
    3. Best practices
    4. Common pitfalls to avoid`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      messages: [
        {
          role: "system",
          content: "You are a security and compliance expert. Your task is to enhance security control descriptions with specific, actionable details."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
    });

    return completion.choices[0]?.message?.content ?? control.description;
  } catch (error) {
    console.error('Error enhancing control description:', error);
    return control.description;
  }
} 