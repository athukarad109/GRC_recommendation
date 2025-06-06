import { Control } from '../types/controls';
import { NLPRequest, NLPResponse, NLPProcessingOptions } from '../types/nlp';
import { processControlsWithAI as processWithAI, enhanceControlDescription } from '../services/nlpService';

// Enhanced controls with more detailed information
const enhancedControls: Record<string, Control[]> = {
  "GDPR": [
    {
      id: "GDPR-001",
      text: "Implement data encryption",
      category: "Data Protection",
      frameworks: ["GDPR"],
      description: "Implement appropriate technical measures to ensure data security, including encryption of personal data",
      priority: "high"
    },
    {
      id: "GDPR-002",
      text: "Maintain audit logs",
      category: "Audit & Monitoring",
      frameworks: ["GDPR"],
      description: "Keep detailed records of data processing activities and maintain audit trails",
      priority: "high"
    },
    {
      id: "GDPR-003",
      text: "Appoint a Data Protection Officer",
      category: "Governance",
      frameworks: ["GDPR"],
      description: "Designate a Data Protection Officer to oversee compliance with GDPR requirements",
      priority: "high"
    },
    {
      id: "GDPR-004",
      text: "Provide data access & deletion rights",
      category: "Data Subject Rights",
      frameworks: ["GDPR"],
      description: "Implement processes to handle data subject requests for access and deletion",
      priority: "high"
    }
  ],
  "PCI DSS": [
    {
      id: "PCI-001",
      text: "Encrypt transmission of cardholder data",
      category: "Data Protection",
      frameworks: ["PCI DSS"],
      description: "Use strong cryptography and security protocols to protect cardholder data during transmission",
      priority: "high"
    },
    {
      id: "PCI-002",
      text: "Maintain audit logs",
      category: "Audit & Monitoring",
      frameworks: ["PCI DSS"],
      description: "Log and monitor all access to network resources and cardholder data",
      priority: "high"
    },
    {
      id: "PCI-003",
      text: "Implement access control policies",
      category: "Access Control",
      frameworks: ["PCI DSS"],
      description: "Restrict access to cardholder data on a need-to-know basis",
      priority: "high"
    },
    {
      id: "PCI-004",
      text: "Monitor system access",
      category: "Audit & Monitoring",
      frameworks: ["PCI DSS"],
      description: "Track and monitor all access to network resources and cardholder data",
      priority: "high"
    }
  ],
  "ISO 27001": [
    {
      id: "ISO-001",
      text: "Conduct regular security assessments",
      category: "Risk Management",
      frameworks: ["ISO 27001"],
      description: "Perform periodic security assessments and vulnerability scans",
      priority: "high"
    },
    {
      id: "ISO-002",
      text: "Implement access control policies",
      category: "Access Control",
      frameworks: ["ISO 27001"],
      description: "Establish and maintain access control policies and procedures",
      priority: "high"
    },
    {
      id: "ISO-003",
      text: "Train employees on security practices",
      category: "Training & Awareness",
      frameworks: ["ISO 27001"],
      description: "Provide regular security awareness training to all employees",
      priority: "medium"
    },
    {
      id: "ISO-004",
      text: "Perform regular backups",
      category: "Data Protection",
      frameworks: ["ISO 27001"],
      description: "Implement and maintain regular backup procedures",
      priority: "high"
    }
  ],
  "HIPAA": [
    {
      id: "HIPAA-001",
      text: "Implement access controls for PHI",
      category: "Access Control",
      frameworks: ["HIPAA"],
      description: "Implement technical policies and procedures for electronic information systems that maintain electronic protected health information",
      priority: "high"
    },
    {
      id: "HIPAA-002",
      text: "Conduct risk assessments",
      category: "Risk Management",
      frameworks: ["HIPAA"],
      description: "Perform regular risk assessments to identify potential threats and vulnerabilities to PHI",
      priority: "high"
    },
    {
      id: "HIPAA-003",
      text: "Implement audit controls",
      category: "Audit & Monitoring",
      frameworks: ["HIPAA"],
      description: "Implement hardware, software, and/or procedural mechanisms to record and examine activity in information systems",
      priority: "high"
    },
    {
      id: "HIPAA-004",
      text: "Maintain transmission security",
      category: "Data Protection",
      frameworks: ["HIPAA"],
      description: "Implement technical security measures to guard against unauthorized access to PHI during transmission",
      priority: "high"
    }
  ],
  "NIST": [
    {
      id: "NIST-001",
      text: "Implement identity and access management",
      category: "Access Control",
      frameworks: ["NIST"],
      description: "Establish and maintain identity and access management controls for systems and data",
      priority: "high"
    },
    {
      id: "NIST-002",
      text: "Conduct continuous monitoring",
      category: "Audit & Monitoring",
      frameworks: ["NIST"],
      description: "Implement continuous monitoring capabilities to detect and respond to security events",
      priority: "high"
    },
    {
      id: "NIST-003",
      text: "Implement data protection measures",
      category: "Data Protection",
      frameworks: ["NIST"],
      description: "Protect data at rest and in transit using appropriate encryption and security controls",
      priority: "high"
    },
    {
      id: "NIST-004",
      text: "Develop incident response procedures",
      category: "Incident Response",
      frameworks: ["NIST"],
      description: "Establish and maintain incident response procedures for security events",
      priority: "high"
    }
  ],
  "DPDPA": [
    {
      id: "DPDPA-001",
      text: "Implement data protection measures",
      category: "Data Protection",
      frameworks: ["DPDPA"],
      description: "Implement appropriate technical and organizational measures to protect personal data",
      priority: "high"
    },
    {
      id: "DPDPA-002",
      text: "Maintain data processing records",
      category: "Audit & Monitoring",
      frameworks: ["DPDPA"],
      description: "Keep detailed records of data processing activities and maintain audit trails",
      priority: "high"
    },
    {
      id: "DPDPA-003",
      text: "Implement data subject rights",
      category: "Data Subject Rights",
      frameworks: ["DPDPA"],
      description: "Establish procedures to handle data subject requests for access, correction, and deletion",
      priority: "high"
    },
    {
      id: "DPDPA-004",
      text: "Conduct data protection impact assessments",
      category: "Risk Management",
      frameworks: ["DPDPA"],
      description: "Perform assessments for high-risk data processing activities",
      priority: "high"
    }
  ],
  "MODPA": [
    {
      id: "MODPA-001",
      text: "Implement data minimization",
      category: "Data Protection",
      frameworks: ["MODPA"],
      description: "Collect and process only necessary personal data for specified purposes",
      priority: "high"
    },
    {
      id: "MODPA-002",
      text: "Maintain data processing records",
      category: "Audit & Monitoring",
      frameworks: ["MODPA"],
      description: "Keep detailed records of data processing activities and maintain audit trails",
      priority: "high"
    },
    {
      id: "MODPA-003",
      text: "Implement data subject rights",
      category: "Data Subject Rights",
      frameworks: ["MODPA"],
      description: "Establish procedures to handle data subject requests for access, correction, and deletion",
      priority: "high"
    },
    {
      id: "MODPA-004",
      text: "Conduct privacy impact assessments",
      category: "Risk Management",
      frameworks: ["MODPA"],
      description: "Perform assessments for high-risk data processing activities",
      priority: "high"
    }
  ]
};

// Function to calculate similarity between two strings using Levenshtein distance
function calculateSimilarity(str1: string, str2: string): number {
  const track = Array(str2.length + 1).fill(null).map(() =>
    Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i += 1) {
    track[0][i] = i;
  }
  for (let j = 0; j <= str2.length; j += 1) {
    track[j][0] = j;
  }

  for (let j = 1; j <= str2.length; j += 1) {
    for (let i = 1; i <= str1.length; i += 1) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      track[j][i] = Math.min(
        track[j][i - 1] + 1,
        track[j - 1][i] + 1,
        track[j - 1][i - 1] + indicator
      );
    }
  }

  const maxLength = Math.max(str1.length, str2.length);
  return 1 - (track[str2.length][str1.length] / maxLength);
}

// Function to process controls through AI
async function processControls(controls: Control[]): Promise<Control[]> {
  if (!controls || controls.length === 0) {
    return [];
  }

  try {
    const options: NLPProcessingOptions = {
      similarityThreshold: 0.8,
      mergeStrategy: 'strict',
      preserveFrameworks: true
    };

    // Process controls with AI
    const processedControls = await processWithAI(controls, options);

    if (!processedControls || !Array.isArray(processedControls)) {
      console.warn('AI processing returned invalid result, falling back to local deduplication');
      return deduplicateControls(controls);
    }

    // Enhance descriptions for each control
    const enhancedControls = await Promise.all(
      processedControls.map(async (control) => {
        try {
          const enhancedDescription = await enhanceControlDescription(control);
          return {
            ...control,
            description: enhancedDescription || control.description
          };
        } catch (error) {
          console.warn(`Failed to enhance description for control ${control.id}, using original description`);
          return control;
        }
      })
    );

    return enhancedControls;
  } catch (error) {
    console.error('Error processing controls with AI:', error);
    // Fallback to local deduplication if AI processing fails
    return deduplicateControls(controls);
  }
}

// Function to get controls for selected frameworks
export async function getControlsForFrameworks(frameworks: string[]): Promise<Control[]> {
  if (!frameworks || !Array.isArray(frameworks) || frameworks.length === 0) {
    return [];
  }

  // Collect all controls from selected frameworks
  const allControls: Control[] = [];
  frameworks.forEach((framework: string) => {
    if (enhancedControls[framework]) {
      allControls.push(...enhancedControls[framework]);
    }
  });

  if (allControls.length === 0) {
    return [];
  }

  // Process controls through AI
  return processControls(allControls);
}

// Keep the existing deduplicateControls function as a fallback
function deduplicateControls(controls: Control[]): Control[] {
  const uniqueControls: Control[] = [];
  const processedIds = new Set<string>();

  // Sort controls by priority (high to low)
  controls.sort((a, b) => {
    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  for (const control of controls) {
    if (processedIds.has(control.id)) continue;

    const similarControls = controls.filter(other => {
      if (other.id === control.id) return false;
      if (processedIds.has(other.id)) return false;
      
      const similarity = calculateSimilarity(
        control.text.toLowerCase(),
        other.text.toLowerCase()
      );
      return similarity > 0.8; // 80% similarity threshold
    });

    if (similarControls.length > 0) {
      // Merge similar controls
      const mergedControl: Control = {
        ...control,
        frameworks: [...new Set([...control.frameworks, ...similarControls.flatMap(c => c.frameworks)])],
        description: control.description || similarControls[0].description,
      };
      uniqueControls.push(mergedControl);
      
      // Mark all similar controls as processed
      processedIds.add(control.id);
      similarControls.forEach(c => processedIds.add(c.id));
    } else {
      uniqueControls.push(control);
      processedIds.add(control.id);
    }
  }

  return uniqueControls;
}