import { Control } from '../types/controls';

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

// Function to deduplicate controls using NLP
export function deduplicateControls(frameworks: string[]): Control[] {
  const allControls: Control[] = [];
  
  // Collect all controls from selected frameworks
  frameworks.forEach(framework => {
    if (enhancedControls[framework]) {
      allControls.push(...enhancedControls[framework]);
    }
  });

  const uniqueControls: Control[] = [];
  const processedIds = new Set<string>();

  // Sort controls by priority (high to low)
  allControls.sort((a, b) => {
    const priorityOrder: Record<string, number> = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  for (const control of allControls) {
    if (processedIds.has(control.id)) continue;

    const similarControls = allControls.filter(other => {
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

// Function to get controls for selected frameworks
export function getControlsForFrameworks(frameworks: string[]): Control[] {
  return deduplicateControls(frameworks);
}