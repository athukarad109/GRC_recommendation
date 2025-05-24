export function recommendFrameworks(formData: OrgFormData): Framework[] {
  // Update the logic to handle infrastructure as an array
  // For example, you might want to recommend frameworks that support ANY of the selected infrastructures
  
  // Example implementation:
  return frameworks.filter(framework => {
    // Check if any of the selected infrastructures are supported by this framework
    const infrastructureMatch = formData.infrastructure.length === 0 || 
      formData.infrastructure.some(infra => framework.infrastructure.includes(infra));
    
    // Other conditions remain the same
    // ...
    
    return infrastructureMatch && otherConditions;
  });
}