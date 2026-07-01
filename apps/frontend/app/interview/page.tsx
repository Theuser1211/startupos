"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ArrowLeft, Check, Loader2, AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { InterviewData } from "@/lib/types";
import { createStartup } from "@/lib/api/startups";
import { isAuthenticated } from "@/lib/api/auth";
import { generateBlueprint } from "@/lib/api/blueprints";
import { useToast } from "@/components/ui/toast";
import { toFriendlyError, apiClient } from "@/lib/api/client";
import { saveGuestStartup, generateId } from "@/lib/utils/guest";
import {
  STAGE_LABELS, INDUSTRY_LABELS, CUSTOMER_LABELS,
  BUSINESS_MODEL_LABELS, PRICE_RANGE_LABELS, PROBLEM_LABELS,
} from "@/lib/types";

interface StepField {
  id: string;
  label: string;
  type: "text" | "textarea" | "select" | "conditional-price";
  placeholder?: string;
  options?: { label: string; value: string }[];
  showIf?: { field: string; is: string[] };
}

interface Step {
  id: string;
  title: string;
  description: string;
  heading: string;
  fields: StepField[];
}

const steps: Step[] = [
  {
    id: "idea",
    title: "What are you building?",
    description: "Describe your startup in one clear sentence.",
    heading: "Your Startup Idea",
    fields: [
      { id: "idea", label: "Describe your startup idea in one sentence", type: "text", placeholder: "AI lawyer for startups" },
    ],
  },
  {
    id: "basics",
    title: "Where are you now?",
    description: "Help us understand your current stage and market.",
    heading: "Stage & Industry",
    fields: [
      { id: "stage", label: "Current Stage", type: "select", options: Object.entries(STAGE_LABELS).map(([value, label]) => ({ label, value })) },
      { id: "industry", label: "Industry", type: "select", options: Object.entries(INDUSTRY_LABELS).map(([value, label]) => ({ label, value })) },
      { id: "industryOther", label: "Describe your industry", type: "text", placeholder: "e.g. LegalTech, SpaceTech, etc.", showIf: { field: "industry", is: ["other"] } },
    ],
  },
  {
    id: "customer",
    title: "Who are you building for?",
    description: "Define your target customer and how you'll charge them.",
    heading: "Customer & Revenue",
    fields: [
      { id: "targetCustomer", label: "Target Customer", type: "select", options: Object.entries(CUSTOMER_LABELS).map(([value, label]) => ({ label, value })) },
      { id: "businessModel", label: "Business Model", type: "select", options: Object.entries(BUSINESS_MODEL_LABELS).map(([value, label]) => ({ label, value })) },
      { id: "priceRange", label: "Target Price Range", type: "select", options: Object.entries(PRICE_RANGE_LABELS).map(([value, label]) => ({ label, value })), showIf: { field: "businessModel", is: ["subscription", "usage"] } },
    ],
  },
  {
    id: "problem",
    title: "What problem do you solve?",
    description: "Identify the core pain point your startup addresses.",
    heading: "Core Problem",
    fields: [
      { id: "problem", label: "Biggest Customer Problem", type: "select", options: Object.entries(PROBLEM_LABELS).map(([value, label]) => ({ label, value })) },
      { id: "problemOther", label: "Describe the problem", type: "textarea", placeholder: "Describe the specific problem your startup solves...", showIf: { field: "problem", is: ["other"] } },
    ],
  },
  {
    id: "done",
    title: "Your Blueprint is Ready!",
    description: "We've analyzed your input and generated a personalized StartupOS Blueprint.",
    heading: "",
    fields: [],
  },
];

const defaultData: InterviewData = {
  idea: "", stage: "ideation", industry: "saas",
  targetCustomer: "b2b-small", businessModel: "subscription",
  priceRange: "$10-50", problem: "cost",
};

function validateStep(step: Step, data: InterviewData): boolean {
  if (step.id === "done") return true;
  return step.fields.every((f) => {
    if (f.showIf) {
      const dependentValue = data[f.showIf.field as keyof InterviewData] as string;
      if (!f.showIf.is.includes(dependentValue)) return true;
    }
    const val = data[f.id as keyof InterviewData];
    if (typeof val === "string") return val.trim().length > 0;
    return val !== undefined && val !== null;
  });
}

function extractCompany(idea: string): string {
  if (!idea || idea.trim().length === 0) return "";
  return idea.trim().split(/\s+/).slice(0, 2).map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}

function ReviewLine({ label, value }: { label: string; value?: string }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-2 font-mono text-xs">
      <span className="text-muted-foreground shrink-0 w-16">{label}:</span>
      <span className="text-foreground">{value}</span>
    </div>
  );
}

export default function InterviewPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(0);
  const [data, setData] = useState<InterviewData>({ ...defaultData });
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [startupId, setStartupId] = useState<string | null>(null);

  const step = steps[currentStep];

  const updateField = (id: string, value: string) => {
    setData((prev) => ({ ...prev, [id]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleFinish = async () => {
    const companyName = extractCompany(data.idea) || "My Startup";

    setIsSaving(true);
    setGenError(null);
    try {
      try {
        localStorage.setItem("startupos-founder", JSON.stringify(data));
      } catch {
      }

      const currentToken = apiClient.getToken();
      if (currentToken) {
        const payload = apiClient.decodeJwtPayload(currentToken);
        if (payload?.exp && typeof payload.exp === 'number' && payload.exp * 1000 < Date.now()) {
          apiClient.clearToken();
        }
      }

      if (isAuthenticated()) {
        setIsGenerating(true);

        let sid = startupId;
        if (!sid) {
          const startup = await createStartup({
            name: companyName,
            industry: data.industry || "other",
          });
          sid = startup.id;
          setStartupId(sid);
        }

        const prompt = [
          `Startup Idea: ${data.idea}`,
          `Stage: ${STAGE_LABELS[data.stage] || data.stage}`,
          `Industry: ${data.industry === "other" ? data.industryOther : INDUSTRY_LABELS[data.industry]}`,
          `Target Customer: ${CUSTOMER_LABELS[data.targetCustomer] || data.targetCustomer}`,
          `Business Model: ${BUSINESS_MODEL_LABELS[data.businessModel] || data.businessModel}`,
          data.priceRange ? `Price Range: ${PRICE_RANGE_LABELS[data.priceRange] || data.priceRange}` : "",
          `Biggest Problem: ${data.problem === "other" ? data.problemOther : PROBLEM_LABELS[data.problem]}`,
        ].filter(Boolean).join("\n");

        await generateBlueprint({ startupId: sid, prompt });

        toast({
          variant: "success",
          title: "Blueprint ready!",
          message: "Your personalized startup blueprint has been generated.",
        });

        setTimeout(() => {
          router.push(`/workspace?id=${sid}`);
        }, 1500);
        return;
      }

      const guestId = generateId();
      saveGuestStartup(guestId, data, companyName);
      document.cookie = "startupos-guest=true; path=/; max-age=3600";

      toast({
        variant: "success",
        title: "Blueprint ready!",
        message: "Your personalized startup blueprint has been generated locally.",
      });

      setTimeout(() => {
        router.push(`/workspace?id=${guestId}`);
      }, 1500);
      return;
    } catch (err) {
      setIsGenerating(false);
      const msg = toFriendlyError(err instanceof Error ? err.message : "Please try again.");
      setGenError(msg);
      toast({
        variant: "error",
        title: "Generation failed",
        message: msg,
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleRetryGeneration = async () => {
    setGenError(null);
    handleFinish();
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="fixed top-0 left-0 right-0 z-40 bg-[#0d0d10] border-b border-[rgba(34,197,94,0.12)]">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/">
            <Image src="/logo-full.png" alt="StartupOS" width={1536} height={1024} className="h-5 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs font-mono">Step {currentStep + 1} of {steps.length}</Badge>
          </div>
        </div>
      </div>

      <div className="fixed top-14 left-0 right-0 h-0.5 bg-white/5 z-40">
        <div
          className="h-full bg-primary"
          style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
        />
      </div>

      <div className="fixed top-[62px] left-0 right-0 z-30 flex justify-center pt-2">
        <div className="flex items-center gap-1.5">
          {steps.slice(0, -1).map((s, i) => (
            <div key={s.id} className={`h-1.5 w-6 rounded-full ${i <= currentStep ? "bg-primary" : "bg-[rgba(34,197,94,0.12)]"}`} />
          ))}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-2xl px-6">
        <div>
          <div key={step.id}>
            {step.id === "done" && isGenerating ? (
              <div className="text-center py-8">
                <div className="mx-auto mb-6 flex h-12 w-12 items-center justify-center rounded bg-primary/10 border border-primary/20">
                  <Loader2 className="h-6 w-6 text-primary animate-spin" />
                </div>
                <p className="text-sm text-muted-foreground">Generating your blueprint...</p>
              </div>
            ) : step.id === "done" && genError ? (
              <div className="text-center py-8">
                <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded bg-red-500/10 border border-red-500/20">
                  <AlertTriangle className="h-7 w-7 text-red-400" />
                </div>
                <h2 className="text-lg font-bold mb-2">Generation Failed</h2>
                <p className="text-sm text-muted-foreground mb-2 max-w-md mx-auto font-mono">
                  {genError}
                </p>
                <p className="text-xs text-muted-foreground/60 mb-8 max-w-md mx-auto">
                  You can retry or save your responses and try again later.
                </p>
                <div className="flex items-center justify-center gap-3">
                  <Button size="lg" onClick={handleRetryGeneration} disabled={isSaving} className="gap-2">
                    {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                    Retry Generation
                  </Button>
                  <Button size="lg" variant="outline" onClick={() => { setGenError(null); setCurrentStep(0); }} className="gap-2">
                    Start Over
                  </Button>
                </div>
              </div>
            ) : step.id === "done" ? (
              <div className="text-center py-8">
                <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded bg-primary/10 border border-primary/20">
                  <Check className="h-8 w-8 text-primary" />
                </div>

                <h2 className="text-2xl font-bold mb-2">Ready to generate</h2>
                <p className="text-sm text-muted-foreground mb-8 max-w-md mx-auto">
                  Your answers will be used to create a personalized startup blueprint with brand analysis, customer profile, revenue model, and more.
                </p>

                <Button size="lg" className="text-sm" onClick={handleFinish} disabled={isSaving}>
                  {isSaving ? "Generating..." : "Generate Blueprint"}
                  {!isSaving && <ArrowRight className="h-4 w-4 ml-1" />}
                </Button>

                <div className="mt-8 max-w-sm mx-auto">
                  <p className="text-xs text-muted-foreground mb-3">Your blueprint will be based on:</p>
                  <div className="space-y-1.5 text-xs text-left">
                    <ReviewLine label="Idea" value={data.idea} />
                    <ReviewLine label="Stage" value={STAGE_LABELS[data.stage]} />
                    <ReviewLine label="Industry" value={data.industry === "other" ? data.industryOther : INDUSTRY_LABELS[data.industry]} />
                    <ReviewLine label="Customer" value={CUSTOMER_LABELS[data.targetCustomer]} />
                    <ReviewLine label="Revenue" value={data.businessModel === "subscription" || data.businessModel === "usage" ? `${BUSINESS_MODEL_LABELS[data.businessModel]} · ${data.priceRange}` : BUSINESS_MODEL_LABELS[data.businessModel]} />
                    <ReviewLine label="Problem" value={data.problem === "other" ? data.problemOther : PROBLEM_LABELS[data.problem]} />
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-8">
                <div className="mb-2">
                  <span className="text-xs text-primary uppercase tracking-wider">Question {currentStep + 1} of {steps.length - 1}</span>
                </div>
                <h2 className="text-xl sm:text-2xl font-bold mb-1">{step.title}</h2>
                <p className="text-xs text-muted-foreground mb-6">{step.description}</p>

                <div className="space-y-4">
                  {step.fields.map((field) => {
                    if (field.showIf) {
                      const dependentValue = data[field.showIf.field as keyof InterviewData] as string;
                      if (!field.showIf.is.includes(dependentValue)) return null;
                    }

                    const currentValue = (data[field.id as keyof InterviewData] as string) || "";
                    const fieldId = field.id;

                    return (
                      <div key={field.id}>
                        <label htmlFor={field.id} className="block text-sm mb-2">{field.label}</label>
                        {field.type === "textarea" ? (
                          <Textarea id={field.id} placeholder={field.placeholder} value={currentValue} onChange={(e) => updateField(fieldId, e.target.value)} className="min-h-[100px]" />
                        ) : field.type === "select" || field.type === "conditional-price" ? (
                          <Select value={currentValue} onValueChange={(value: string) => updateField(fieldId, value)}>
                            <SelectTrigger id={field.id}><SelectValue placeholder="Select an option..." /></SelectTrigger>
                            <SelectContent>
                              {field.options?.map((opt) => (
                                <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input id={field.id} type="text" placeholder={field.placeholder} value={currentValue} onChange={(e) => updateField(fieldId, e.target.value)} />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 flex items-center justify-between">
                  <Button variant="ghost" onClick={prevStep} disabled={currentStep === 0} className="gap-1.5 font-mono text-xs h-8">
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </Button>
                  <Button onClick={nextStep} disabled={!validateStep(step, data)} className="gap-1.5 font-mono text-xs h-8 border border-primary/30 bg-primary/10 hover:bg-primary/20 text-primary">
                    Continue <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
