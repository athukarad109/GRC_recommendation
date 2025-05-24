import { OrgFormData } from "../types/formData";

export function recommendFrameworks(data: OrgFormData) {
    const required: string[] = [];
    const recommended: string[] = [];

    if (data.customerLocations.includes("EU") || data.locations.includes("EU")) {
        required.push("GDPR");
    }
    if (data.dataTypes.includes("PHI")) {
        required.push("HIPAA");
    }
    if (data.dataTypes.includes("Payment Data")) {
        required.push("PCI DSS");
    }
    if (data.locations.includes("India")) {
        required.push("DPDPA");
    }
    if (data.locations.includes("Maryland")) {
        required.push("MODPA");
    }
    if (data.customerType === "B2B" && !data.infra.includes("On-prem")) {
        recommended.push("SOC 2");
    }
    if (data.sector.includes("Healthcare") || data.sector.includes("Fintech")) {
        recommended.push("ISO 27001");
    }

    return { required, recommended };
}
