import { Control } from '../types/controls';
import { NLPProcessingOptions } from '../types/nlp';

// Function to make Ollama API request
async function makeOllamaRequest(prompt: string, options: {
  model?: string;
  num_predict?: number;
  temperature?: number;
  top_k?: number;
  top_p?: number;
} = {}) {
  const controller = new AbortController();
  const timeout = 30000; // 30 seconds timeout
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    console.log('Making request to Ollama with prompt:', prompt.substring(0, 100) + '...');
    
    const requestBody = {
      model: options.model || 'llama2:7b',
      prompt: prompt,
      stream: false,
      num_predict: options.num_predict || 100,
      temperature: options.temperature || 0.7,
      top_k: options.top_k || 40,
      top_p: options.top_p || 0.9
    };
    
    console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Ollama API error response:', {
        status: response.status,
        statusText: response.statusText,
        errorText: errorText
      });
      throw new Error(`Ollama API error: ${response.statusText}. Details: ${errorText}`);
    }

    const data = await response.json();
    console.log('Successfully received response from Ollama');
    return data.response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        console.error('Ollama request timed out after', timeout, 'ms');
        throw new Error('Ollama request timed out. Please check if Ollama is running and try again.');
      }
      if (error.message.includes('fetch')) {
        console.error('Failed to connect to Ollama. Please ensure Ollama is running at http://localhost:11434');
        throw new Error('Cannot connect to Ollama. Please start Ollama and try again.');
      }
    }
    console.error('Error in Ollama request:', error);
    throw error;
  }
}

// Function to process controls using Ollama
export async function processControlsWithOllama(
  controls: Control[],
  options: NLPProcessingOptions
): Promise<Control[]> {
  try {
    const prompt = `You are a security and compliance expert. Your task is to analyze and deduplicate security controls while preserving their essential requirements and framework-specific details.

    Analyze and deduplicate the following security and compliance controls. 
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

    IMPORTANT: You must respond with a valid JSON object in the following format:
    {
      "processedControls": [
        {
          "id": "string",
          "text": "string",
          "name": "string",
          "category": "string",
          "frameworks": ["string"],
          "description": "string",
          "priority": "high" | "medium" | "low"
        }
      ]
    }

    Do not include any other text or explanation, only the JSON object.`;

    const data = await makeOllamaRequest(prompt);
    const responseText = data.response || '{}';
    
    try {
      // Try to find JSON in the response text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
      const parsedResponse = JSON.parse(jsonStr);
      
      if (!parsedResponse.processedControls || !Array.isArray(parsedResponse.processedControls)) {
        console.warn('Invalid response format from Ollama, using original controls');
        return controls;
      }
      
      return parsedResponse.processedControls;
    } catch (parseError) {
      console.error('Failed to parse Ollama response as JSON:', parseError);
      console.error('Raw response:', responseText);
      return controls;
    }
  } catch (error) {
    console.error('Error processing controls with Ollama:', error);
    throw error;
  }
}

// Function to generate control description using Ollama
export async function generateControlDescriptionWithOllama(
  control: Control,
  options: NLPProcessingOptions
): Promise<string> {
  try {
    const prompt = `You are a security control expert. Your task is to generate a detailed description for a security control.

    Generate a detailed description for the following security control:

    Control ID: ${control.id}
    Name: ${control.name}
    Current Description: ${control.description || 'No description provided'}
    Frameworks: ${control.frameworks?.join(', ') || 'None'}
    Priority: ${control.priority}

    Requirements:
    - Be specific and actionable
    - Include technical details
    - Reference relevant security standards
    - Keep it concise but comprehensive

    IMPORTANT: Return only the description text, no additional formatting, JSON, or explanation.`;

    console.log('Attempting to connect to Ollama at http://localhost:11434...');
    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama2:7b',
        prompt: prompt,
        stream: false,
      }),
    });

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();
      console.error('Ollama API request failed with status:', ollamaResponse.status);
      console.error('Error details:', errorText);
      throw new Error(`Ollama API request failed: ${ollamaResponse.status} ${errorText}`);
    }

    const data = await ollamaResponse.json();
    return data.response?.trim() || control.description || '';
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Failed to connect to Ollama. Please ensure Ollama is running at http://localhost:11434');
      throw new Error('Ollama is not running. Please start Ollama and try again.');
    }
    console.error('Error generating control description with Ollama:', error);
    throw error;
  }
}

// Function to generate implementation steps using Ollama
export async function generateImplementationStepsWithOllama(
  control: Control,
  options: NLPProcessingOptions
): Promise<string[]> {
  try {
    const prompt = `You are a security control expert. Your task is to generate implementation steps for a security control.

    Generate detailed implementation steps for the following security control:

    Control ID: ${control.id}
    Name: ${control.name}
    Description: ${control.description || 'No description provided'}
    Frameworks: ${control.frameworks?.join(', ') || 'None'}
    Priority: ${control.priority}

    Requirements:
    - Provide clear, actionable steps
    - Include technical details
    - Consider dependencies
    - Include verification steps
    - Keep steps concise but complete

    IMPORTANT: You must respond with a valid JSON array of strings in the following format:
    [
      "Step 1 description",
      "Step 2 description",
      "Step 3 description"
    ]

    Do not include any other text or explanation, only the JSON array.`;

    console.log('Attempting to connect to Ollama at http://localhost:11434...');
    const ollamaResponse = await fetch('http://localhost:11434/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'llama2:7b',
        prompt: prompt,
        stream: false,
      }),
    });

    if (!ollamaResponse.ok) {
      const errorText = await ollamaResponse.text();
      console.error('Ollama API request failed with status:', ollamaResponse.status);
      console.error('Error details:', errorText);
      throw new Error(`Ollama API request failed: ${ollamaResponse.status} ${errorText}`);
    }

    const data = await ollamaResponse.json();
    const responseText = data.response || '[]';
    
    try {
      // Try to find JSON array in the response text
      const jsonMatch = responseText.match(/\[[\s\S]*\]/);
      const jsonStr = jsonMatch ? jsonMatch[0] : responseText;
      const steps = JSON.parse(jsonStr);
      
      if (!Array.isArray(steps)) {
        console.warn('Invalid response format from Ollama, returning empty array');
        return [];
      }
      
      return steps;
    } catch (parseError) {
      console.error('Failed to parse Ollama response as JSON:', parseError);
      console.error('Raw response:', responseText);
      return [];
    }
  } catch (error) {
    if (error instanceof TypeError && error.message.includes('fetch')) {
      console.error('Failed to connect to Ollama. Please ensure Ollama is running at http://localhost:11434');
      throw new Error('Ollama is not running. Please start Ollama and try again.');
    }
    console.error('Error generating implementation steps with Ollama:', error);
    throw error;
  }
}

// Function to get basic framework recommendation
function getBasicFrameworkRecommendation(answers: Record<string, string>): string {
  const size = answers['size']?.toLowerCase() || '';
  const industry = answers['industry']?.toLowerCase() || '';
  const needs = answers['needs']?.toLowerCase() || '';

  // Basic recommendation logic based on organization size and industry
  if (size.includes('small') || size.includes('startup')) {
    return 'ISO 27001 is recommended for small organizations as it provides a flexible and scalable approach to information security management.';
  } else if (industry.includes('health') || industry.includes('medical')) {
    return 'HIPAA compliance is essential for healthcare organizations to protect patient data and ensure privacy.';
  } else if (industry.includes('finance') || industry.includes('banking')) {
    return 'PCI DSS is recommended for financial institutions to ensure secure handling of payment card information.';
  } else if (needs.includes('data protection') || needs.includes('privacy')) {
    return 'GDPR compliance is recommended for organizations handling personal data of EU citizens.';
  } else {
    return 'ISO 27001 is recommended as a comprehensive information security management framework suitable for most organizations.';
  }
}

// Function to get framework recommendation
export async function getFrameworkRecommendation(answers: Record<string, string>): Promise<string> {
  try {
    const prompt = `Based on the following answers to compliance framework questions, recommend the most suitable framework. 
      Consider the organization's size, industry, and specific needs. Provide a clear recommendation with brief justification.
      
      Answers:
      ${Object.entries(answers).map(([key, value]) => `${key}: ${value}`).join('\n')}`;

    return await makeOllamaRequest(prompt);
  } catch (error) {
    console.error('Error getting framework recommendation from Ollama:', error);
    return getBasicFrameworkRecommendation(answers);
  }
} 