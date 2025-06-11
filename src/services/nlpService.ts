import { Control } from '../types/controls';
import { NLPProcessingOptions } from '../types/nlp';
import { Ollama } from 'ollama';

// Initialize Ollama client
const ollama = new Ollama({
  host: 'http://localhost:11434'
});

// Function to make Ollama API request
async function makeOllamaRequest(prompt: string, options: {
  model?: string;
  num_predict?: number;
  temperature?: number;
  top_k?: number;
  top_p?: number;
} = {}) {
  try {
    console.log('Making request to Ollama with prompt:', prompt.substring(0, 100) + '...');
    
    const response = await ollama.generate({
      model: options.model || 'llama2',
      prompt: prompt,
      stream: false,
      options: {
        num_predict: options.num_predict || 500,
        temperature: options.temperature || 0.7,
        top_k: options.top_k || 40,
        top_p: options.top_p || 0.9
      }
    });

    console.log('Successfully received response from Ollama');
    return response.response;
  } catch (error) {
    console.error('Error in Ollama request:', error);
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        throw new Error('Cannot connect to Ollama. Please ensure Ollama is running at http://localhost:11434');
      }
    }
    throw error;
  }
}

// Function to process controls using Ollama
export async function processControlsWithOllama(
  controls: Control[],
  options: NLPProcessingOptions
): Promise<Control[]> {
  try {
    const prompt = `You are a security and compliance expert specializing in control analysis and optimization. Your task is to analyze and deduplicate security controls while preserving their essential requirements and framework-specific details.

    Analyze the following security and compliance controls:
    ${JSON.stringify(controls, null, 2)}

    Requirements:
    1. Identify and merge similar controls based on:
       - Core security requirements
       - Technical implementation details
       - Framework-specific requirements
       - Priority levels
    2. Similarity threshold: ${options.similarityThreshold}
    3. Merge strategy: ${options.mergeStrategy}
    4. Preserve frameworks: ${options.preserveFrameworks}

    Return a JSON object in this exact format:
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

    Focus on:
    - Maintaining technical accuracy
    - Preserving framework compliance
    - Ensuring clear, actionable controls
    - Eliminating redundancy while keeping essential requirements

    Return ONLY the JSON object, no additional text.`;

    const responseText = await makeOllamaRequest(prompt, {
      num_predict: 1000,
      temperature: 0.7
    });
    
    try {
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
    const prompt = `You are a security control expert. Generate a detailed, technical description for this security control:

    Control ID: ${control.id}
    Name: ${control.name}
    Current Description: ${control.description || 'No description provided'}
    Frameworks: ${control.frameworks?.join(', ') || 'None'}
    Priority: ${control.priority}

    Requirements:
    1. Be specific and technically precise
    2. Include implementation considerations
    3. Reference relevant security standards
    4. Address compliance requirements
    5. Include risk context
    6. Keep it concise but comprehensive

    Return ONLY the description text, no additional formatting or explanation.`;

    const response = await makeOllamaRequest(prompt, {
      num_predict: 500,
      temperature: 0.7
    });
    return response.trim() || control.description || '';
  } catch (error) {
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
    const prompt = `You are a security control implementation expert. Generate detailed implementation steps for this security control:

    Control ID: ${control.id}
    Name: ${control.name}
    Description: ${control.description || 'No description provided'}
    Frameworks: ${control.frameworks?.join(', ') || 'None'}
    Priority: ${control.priority}

    Requirements:
    1. Provide clear, actionable steps
    2. Include technical details and configurations
    3. Consider dependencies and prerequisites
    4. Include verification and testing steps
    5. Address potential challenges
    6. Include monitoring and maintenance steps

    Return a JSON array of strings in this exact format:
    [
      "Step 1: Detailed description",
      "Step 2: Detailed description",
      "Step 3: Detailed description"
    ]

    Return ONLY the JSON array, no additional text.`;

    const responseText = await makeOllamaRequest(prompt, {
      num_predict: 800,
      temperature: 0.7
    });
    
    try {
      // Find all JSON arrays in the response
      const jsonArrays = responseText.match(/\[[\s\S]*?\]/g) || [];
      
      // Try to parse each array and combine valid steps
      const allSteps: string[] = [];
      
      for (const jsonStr of jsonArrays) {
        try {
          const steps = JSON.parse(jsonStr);
          if (Array.isArray(steps)) {
            allSteps.push(...steps);
          }
        } catch (e) {
          // Skip invalid JSON arrays
          continue;
        }
      }

      if (allSteps.length > 0) {
        // Remove duplicates and sort by step number
        const uniqueSteps = Array.from(new Set(allSteps))
          .sort((a, b) => {
            const numA = parseInt(a.match(/Step (\d+)/)?.[1] || '0');
            const numB = parseInt(b.match(/Step (\d+)/)?.[1] || '0');
            return numA - numB;
          });
        return uniqueSteps;
      }

      // If no valid JSON arrays found, try to extract from plain text
      const plainSteps = responseText.split('\n')
        .map(line => line.trim())
        .filter(line => line.startsWith('Step') && line.includes(':'))
        .map(line => {
          const [stepNum, ...rest] = line.split(':');
          return `Step ${stepNum.replace('Step', '').trim()}: ${rest.join(':').trim()}`;
        });

      if (plainSteps.length > 0) {
        return plainSteps;
      }
      
      return [];
    } catch (parseError) {
      console.error('Failed to parse Ollama response:', parseError);
      console.error('Raw response:', responseText);
      return [];
    }
  } catch (error) {
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