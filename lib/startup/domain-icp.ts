import type { InterviewData } from "@/lib/types";

/* ─── Domain ICP v2 — idea + target customer aware ─── */

export interface DomainIcpData {
  title: string;
  role: string;
  companySize: string;
  description: string;
  painPoints: string[];
  goals: string[];
  objections: string[];
}

const domainIcpRegistry: Record<string, {
  default: DomainIcpData;
  b2b?: Partial<DomainIcpData>;
  b2c?: Partial<DomainIcpData>;
  marketplace?: Partial<DomainIcpData>;
  enterprise?: Partial<DomainIcpData>;
}> = {
  legal: {
    default: {
      title: "General Counsel / Head of Legal",
      role: "Legal decision-maker at a company or law firm",
      companySize: "50-500 employees",
      description: "A legal professional frustrated by manual document review, unpredictable outside counsel costs, and the need to modernize legal operations without compromising confidentiality.",
      painPoints: [
        "Routine contract review consumes hundreds of billable hours monthly",
        "Outside counsel fees are unpredictable and growing",
        "Legal document management is still manual and error-prone",
        "Staying compliant with evolving regulations is resource-intensive",
      ],
      goals: [
        "Automate contract review and due diligence by 70%",
        "Reduce outside counsel spend on routine matters by 40%",
        "Maintain attorney-client privilege while adopting AI",
        "Standardize legal workflows across the organization",
      ],
      objections: [
        "\"AI can't understand the nuance of legal work\"",
        "\"We need to maintain attorney-client privilege\"",
        "\"Our existing document management system is sufficient\"",
        "\"We're too small for dedicated legal tech\"",
      ],
    },
    b2b: {
      title: "Founder / General Counsel",
      role: "Decision-maker at a startup or small business",
      companySize: "1-50 employees",
      description: "A founder or GC at an early-stage startup frustrated by $500+/hr legal fees for routine work like contract review, IP filings, and cap table management.",
    },
  },
  veterinary: {
    default: {
      title: "Veterinary Practice Manager",
      role: "Operations decision-maker at a veterinary practice",
      companySize: "1-10 employees",
      description: "A veterinary professional frustrated by manual appointment scheduling, scattered patient records, and the challenge of running a practice while delivering quality care.",
      painPoints: [
        "Scheduling and appointment management is manual and error-prone",
        "Pet medical records are scattered across paper and legacy systems",
        "Client no-show rates eat into practice revenue",
        "Finding qualified staff is increasingly difficult",
      ],
      goals: [
        "Digitize patient records for instant access across locations",
        "Reduce appointment no-shows through automated reminders",
        "Increase average revenue per visit with treatment plan tools",
        "Streamline inventory management for medications and supplies",
      ],
      objections: [
        "\"We already have a practice management system\"",
        "\"Our clients are older and prefer phone calls\"",
        "\"Pet health data privacy is a concern\"",
        "\"We don't have time to learn new software\"",
      ],
    },
    marketplace: {
      title: "Veterinarian / Pet Care Provider",
      role: "Independent or employed practitioner looking to fill appointment slots",
      companySize: "Solo or small practice",
      description: "A veterinarian or pet care provider looking for a reliable stream of qualified clients without spending hours on marketing and scheduling.",
      painPoints: [
        "Empty appointment slots mean lost revenue every day",
        "Marketing to find new clients is expensive and time-consuming",
        "Last-minute cancellations are hard to fill quickly",
        "Managing online reputation across multiple review sites is tedious",
      ],
      goals: [
        "Fill appointment slots with qualified, pre-screened clients",
        "Reduce no-shows with automated reminders and deposits",
        "Build a steady stream of repeat clients without advertising spend",
        "Focus on medicine instead of marketing",
      ],
      objections: [
        "\"I already have a full client list\"",
        "\"I don't want to pay commission on my existing clients\"",
        "\"How do you verify clients are legitimate?\"",
        "\"I'm not comfortable with online booking\"",
      ],
    },
    b2c: {
      title: "Pet Owner",
      role: "Consumer looking for convenient, trustworthy pet care",
      companySize: "Individual",
      description: "A pet owner frustrated by the hassle of finding available vet appointments, comparing prices, and managing their pet's health records across multiple clinics.",
      painPoints: [
        "Finding a vet with available appointments takes hours of phone calls",
        "Pet medical records are paper-based and hard to transfer between vets",
        "Emergency care options are unclear after hours",
        "Prices for common procedures vary wildly between clinics",
      ],
      goals: [
        "Book a vet appointment in under 60 seconds online",
        "Access all pet medical records in one place",
        "Compare prices and reviews before choosing a provider",
        "Get reminders for vaccinations and checkups automatically",
      ],
      objections: [
        "\"I already have a vet I trust\"",
        "\"How do I know these providers are qualified?\"",
        "\"I prefer to call and talk to someone\"",
        "\"What if my pet has an emergency?\"",
      ],
    },
  },
  fintech: {
    default: {
      title: "Chief Compliance Officer",
      role: "Regulatory compliance executive at a financial institution",
      companySize: "500-5000+ employees",
      description: "A compliance executive at a large financial institution navigating the complexity of multi-jurisdiction regulatory requirements, manual reporting processes, and the cost of compliance failures.",
      painPoints: [
        "Regulatory reporting is still a manual, spreadsheet-driven process",
        "KYC/AML compliance costs eat into margins",
        "Staying compliant across multiple jurisdictions is overwhelming",
        "Audit preparation requires weeks of manual effort",
      ],
      goals: [
        "Automate regulatory reporting across all jurisdictions",
        "Reduce compliance operational costs by 40%",
        "Achieve real-time monitoring of regulatory changes",
        "Pass audits with zero findings on first attempt",
      ],
      objections: [
        "\"We're too regulated to adopt new technology\"",
        "\"Our existing compliance vendor works fine\"",
        "\"How do you handle data residency and sovereignty?\"",
        "\"We need SOC 2 Type II certification to even evaluate you\"",
      ],
    },
    enterprise: {
      title: "Chief Compliance Officer / Head of Regulatory Operations",
      role: "Executive responsible for regulatory compliance at a financial institution",
      companySize: "1000-10000+ employees",
    },
    b2b: {
      title: "CTO / Head of Engineering",
      role: "Engineering leader at a financial technology company",
      companySize: "50-500 employees",
      description: "An engineering leader at a growing FinTech company frustrated by the gap between the need for rapid product iteration and the constraints of regulatory compliance.",
      painPoints: [
        "Compliance requirements slow down every product release",
        "Integrating with legacy banking systems is painful and slow",
        "Security audits derail engineering sprints",
        "Balancing innovation speed with regulatory approval is a constant tension",
      ],
    },
  },
  healthcare: {
    default: {
      title: "Chief Medical Information Officer",
      role: "Clinical technology decision-maker at a healthcare organization",
      companySize: "500-5000+ employees",
      description: "A healthcare technology executive responsible for digital transformation, drowning in legacy EMR systems, interoperability nightmares, and the pressure to improve patient outcomes while reducing costs.",
      painPoints: [
        "EMR systems don't talk to each other — patient data is siloed",
        "HIPAA compliance makes every engineering change a legal review",
        "Clinician burnout from poorly designed digital tools is at crisis levels",
        "Telehealth infrastructure is stuck at 2019 quality",
      ],
      goals: [
        "Achieve true interoperability between EMR systems",
        "Reduce clinician administrative burden by 30%",
        "Improve patient outcomes with data-driven clinical insights",
        "Meet evolving regulatory and reporting requirements",
      ],
      objections: [
        "\"We just invested $10M in Epic\"",
        "\"HIPAA compliance is too risky with third parties\"",
        "\"Our clinicians won't adopt another tool\"",
        "\"How do you integrate with our existing stack?\"",
      ],
    },
    b2c: {
      title: "Patient / Healthcare Consumer",
      role: "Individual managing their own or a family member's healthcare",
      companySize: "Individual",
      description: "A patient frustrated by fragmented healthcare experiences — managing appointments with multiple specialists, confusing billing, and medical records scattered across different provider portals.",
      painPoints: [
        "Seeing multiple specialists means repeating the same info to each one",
        "Medical bills are confusing and often contain errors",
        "Health records are stuck in different provider portals that don't talk to each other",
        "Finding available specialist appointments takes days of phone tag",
      ],
      goals: [
        "Access all medical records from one dashboard",
        "Book appointments with any provider in seconds online",
        "Understand medical bills before paying them",
        "Get proactive health reminders and preventive care notifications",
      ],
      objections: [
        "\"My current doctor knows my history\"",
        "\"I don't want my health data shared\"",
        "\"I'm healthy — I don't need this\"",
        "\"My insurance won't cover this\"",
      ],
    },
  },
  ecommerce: {
    default: {
      title: "Head of E-Commerce",
      role: "E-commerce director at a retail business",
      companySize: "50-500 employees",
      description: "An e-commerce leader at a mid-market retailer struggling to differentiate against Amazon and Shopify-powered competitors while managing inventory across multiple channels.",
      painPoints: [
        "Shopify templates make every store look the same",
        "Inventory management across web, retail, and marketplaces is chaotic",
        "Customer acquisition costs have doubled in 3 years",
        "International shipping and duties are too complex to manage",
      ],
      goals: [
        "Increase average order value by 20% through personalization",
        "Reduce cart abandonment rate below 60%",
        "Launch unified inventory across all sales channels",
        "Expand to international markets with automated compliance",
      ],
      objections: [
        "\"We're already on Shopify and it works fine\"",
        "\"Migrating our catalog would take months\"",
        "\"How do you handle PCI compliance for payments?\"",
        "\"Our team doesn't have technical resources for integration\"",
      ],
    },
    b2c: {
      title: "Online Shopper",
      role: "Consumer buying products online",
      companySize: "Individual",
      description: "A frequent online shopper frustrated by inconsistent product quality, confusing return policies, and the inability to find exactly what they want without endless scrolling.",
      painPoints: [
        "Product quality and sizing are inconsistent across brands",
        "Returning items is a hassle with confusing policies",
        "Finding specific products requires searching multiple sites",
        "Shipping costs and delivery times vary unpredictably",
      ],
      goals: [
        "Find exactly what I want without endless browsing",
        "Trust that product descriptions match reality",
        "Get fast, free shipping with easy returns on every order",
        "Compare prices across sellers without manual effort",
      ],
      objections: [
        "\"Amazon already has everything I need\"",
        "\"I don't trust product reviews anymore\"",
        "\"Shipping takes too long from small brands\"",
        "\"What if I need to return something?\"",
      ],
    },
  },
};

/**
 * Classify a startup idea into a domain based on keyword matching.
 * Returns null if no domain matches.
 */
export function classifyDomain(idea: string): string | null {
  const lower = idea.toLowerCase();
  if (/\b(lawyer|legal|law|attorney|litigation|contract|esq)\b/.test(lower)) return "legal";
  if (/\b(veterinary|vet|pet|animal|veterinarian|pets)\b/.test(lower)) return "veterinary";
  if (/\b(fintech|compliance|regulatory|kyc|aml|banking|underwriting)\b/.test(lower)) return "fintech";
  if (/\b(healthcare|health|medical|hospital|clinic|patient|doctor|clinical)\b/.test(lower)) return "healthcare";
  if (/\b(ecommerce|e-commerce|retail|shop|store|marketplace|d2c|dtc)\b/.test(lower)) return "ecommerce";
  return null;
}

/**
 * Select the best ICP data for a given domain and target customer type.
 * Merges domain defaults with customer-specific variant (b2b, b2c, marketplace, enterprise).
 */
export function selectDomainIcp(domain: string, targetCustomer: string): DomainIcpData {
  const entry = domainIcpRegistry[domain];
  if (!entry) throw new Error(`Unknown domain: ${domain}`);

  let variant: Partial<DomainIcpData> | undefined;

  if (targetCustomer.startsWith("b2b-enterprise")) {
    variant = entry.enterprise ?? entry.b2b;
  } else if (targetCustomer.startsWith("b2b")) {
    variant = entry.b2b;
  } else if (targetCustomer.startsWith("marketplace")) {
    variant = entry.marketplace;
  } else if (targetCustomer.startsWith("b2c")) {
    variant = entry.b2c;
  }

  if (!variant) return { ...entry.default };

  return {
    ...entry.default,
    ...variant,
    painPoints: variant.painPoints ?? entry.default.painPoints,
    goals: variant.goals ?? entry.default.goals,
    objections: variant.objections ?? entry.default.objections,
  };
}

/**
 * Compose the ICP for a startup using idea + target customer awareness.
 * Falls back to the industry profile if no domain is matched.
 */
export function composeIcp(
  data: InterviewData,
  industryProfile: {
    icpTitle: string;
    icpRole: string;
    icpCompanySize: string;
    icpDesc: (customer: string) => string;
    painPoints: readonly string[];
    goals: readonly string[];
    objections: readonly string[];
    icpRecommendations: readonly string[];
  },
): {
  title: string;
  role: string;
  companySize: string;
  description: string;
  painPoints: string[];
  goals: string[];
  objections: string[];
  recommendations: string[];
} {
  const domain = classifyDomain(data.idea);

  if (domain) {
    const domainIcp = selectDomainIcp(domain, data.targetCustomer);
    return {
      ...domainIcp,
      recommendations: [...industryProfile.icpRecommendations],
    };
  }

  // Fall back to industry profile (current behavior)
  return {
    title: industryProfile.icpTitle,
    role: industryProfile.icpRole,
    companySize: industryProfile.icpCompanySize,
    description: industryProfile.icpDesc(data.targetCustomer),
    painPoints: [...industryProfile.painPoints],
    goals: [...industryProfile.goals],
    objections: [...industryProfile.objections],
    recommendations: [...industryProfile.icpRecommendations],
  };
}
