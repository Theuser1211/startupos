"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { StagedProgress } from "@/components/ui/staged-progress";
import { ArrowRight, ArrowLeft, Check, Loader2, Sparkles, AlertTriangle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { InterviewData } from "@/lib/types";
import { createStartup } from "@/lib/api/startups";
import { isAuthenticated } from "@/lib/api/auth";
import { generateBlueprint } from "@/lib/api/blueprints";
import { useToast } from "@/components/ui/toast";
import { toFriendlyError } from "@/lib/api/client";
import { fireCelebration } from "@/lib/confetti";
import {
  STAGE_LABELS, INDUSTRY_LABELS, CUSTOMER_LABELS,
  BUSINESS_MODEL_LABELS, PRICE_RANGE_LABELS, PROBLEM_LABELS,
} from "@/lib/types";

const blueprintStages = [
  { label: "Analyzing idea", description: "Understanding your startup concept" },
  { label: "Researching market", description: "Analyzing industry and competition" },
  { label: "Designing model", description: "Building business and revenue model" },
  { label: "Building roadmap", description: "Creating product roadmap and milestones" },
  { label: "Finalizing", description: "Generating your complete blueprint" },
];

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
  targetCustomer: "b2b-small", businessModel: "subscription", problem: "cost",
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
    <div className="flex items-start gap-2">
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
  const [direction, setDirection] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genStage, setGenStage] = useState(0);
  const [genProgress, setGenProgress] = useState(0);
  const [genError, setGenError] = useState<string | null>(null);
  const genTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const step = steps[currentStep];

  const updateField = (id: string, value: string) => {
    setData((prev) => ({ ...prev, [id]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setDirection(1);
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setDirection(-1);
      setCurrentStep((prev) => prev - 1);
    }
  };

  useEffect(() => {
    if (isGenerating) {
      const totalDuration = 15000;
      const interval = 200;
      const stepDuration = totalDuration / blueprintStages.length;
      let elapsed = 0;

      genTimerRef.current = setInterval(() => {
        elapsed += interval;
        const rawProgress = (elapsed / totalDuration) * 100;
        const stageIndex = Math.min(Math.floor(elapsed / stepDuration), blueprintStages.length - 1);
        setGenStage(stageIndex);
        setGenProgress(Math.min(rawProgress, 95));
      }, interval);

      return () => {
        if (genTimerRef.current) clearInterval(genTimerRef.current);
      };
    }
  }, [isGenerating]);

  const handleFinish = async () => {
    const companyName = extractCompany(data.idea) || "My Startup";

    setIsSaving(true);
    setGenError(null);
    try {
      try {
        localStorage.setItem("startupos-founder", JSON.stringify(data));
      } catch {
        // localStorage unavailable, continue
      }

      if (isAuthenticated()) {
        setIsGenerating(true);

        const startup = await createStartup({
          name: companyName,
          industry: data.industry || "other",
        });

        const prompt = [
          `Startup Idea: ${data.idea}`,
          `Stage: ${STAGE_LABELS[data.stage] || data.stage}`,
          `Industry: ${data.industry === "other" ? data.industryOther : INDUSTRY_LABELS[data.industry]}`,
          `Target Customer: ${CUSTOMER_LABELS[data.targetCustomer] || data.targetCustomer}`,
          `Business Model: ${BUSINESS_MODEL_LABELS[data.businessModel] || data.businessModel}`,
          data.priceRange ? `Price Range: ${PRICE_RANGE_LABELS[data.priceRange] || data.priceRange}` : "",
          `Biggest Problem: ${data.problem === "other" ? data.problemOther : PROBLEM_LABELS[data.problem]}`,
        ].filter(Boolean).join("\n");

        await generateBlueprint({ startupId: startup.id, prompt });

        setGenStage(blueprintStages.length - 1);
        setGenProgress(100);
        if (genTimerRef.current) clearInterval(genTimerRef.current);

        fireCelebration();

        toast({
          variant: "success",
          title: "Blueprint ready!",
          message: "Your personalized startup blueprint has been generated.",
        });

        setTimeout(() => {
          router.push(`/workspace?id=${startup.id}`);
        }, 1500);
        return;
      }

      router.push("/workspace");
    } catch (err) {
      setIsGenerating(false);
      if (genTimerRef.current) {
        clearInterval(genTimerRef.current);
        genTimerRef.current = null;
      }
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

  const handleRetryGeneration = () => {
    setGenError(null);
    handleFinish();
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      <div className="absolute inset-0 grid-bg" />
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-purple-600/10 blur-[120px]" />

      <div className="fixed top-0 left-0 right-0 z-40 glass-strong border-b border-glass-border">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-6">
          <Link href="/">
            <Image src="/logo-full.png" alt="StartupOS" width={1536} height={1024} className="h-5 w-auto" />
          </Link>
          <div className="flex items-center gap-3">
            <Badge variant="outline" className="text-xs">Step {currentStep + 1} of {steps.length}</Badge>
          </div>
        </div>
      </div>

      <div className="fixed top-14 left-0 right-0 h-0.5 bg-white/5 z-40">
        <motion.div
          className="h-full bg-gradient-to-r from-primary to-secondary"
          initial={{ width: "0%" }}
          animate={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        />
      </div>

      <div className="fixed top-[62px] left-0 right-0 z-30 flex justify-center pt-2">
        <div className="flex items-center gap-1.5">
          {steps.slice(0, -1).map((s, i) => (
            <div key={s.id} className={`h-1.5 w-6 rounded-full transition-all duration-300 ${i <= currentStep ? "bg-primary/60" : "bg-white/10"}`} />
          ))}
        </div>
      </div>

      <div className="relative z-10 w-full max-w-2xl px-6">
        <div className="overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step.id}
              custom={direction}
              initial={{ opacity: 0, x: direction > 0 ? 100 : -100, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: direction > 0 ? -100 : 100, scale: 0.98 }}
              transition={{ duration: 0.35, ease: "easeInOut" }}
            >
              {step.id === "done" && isGenerating ? (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  >
                    <div className="mx-auto mb-8 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-purple-400 shadow-xl shadow-purple-500/30">
                      <Sparkles className="h-8 w-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-display font-bold mb-8">Generating Your Blueprint</h2>
                    <StagedProgress stages={blueprintStages} currentStage={genStage} progress={genProgress} />
                  </motion.div>
                </div>
              ) : step.id === "done" && genError ? (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-500/10 border border-red-500/20">
                      <AlertTriangle className="h-8 w-8 text-red-400" />
                    </div>
                    <h2 className="text-2xl font-display font-bold mb-3">Generation Failed</h2>
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
                  </motion.div>
                </div>
              ) : step.id === "done" ? (
                <div className="text-center py-8">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 200, damping: 15 }}
                    className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-secondary shadow-xl shadow-primary/30"
                  >
                    <Check className="h-10 w-10 text-white" />
                  </motion.div>

                  <h2 className="text-3xl font-display font-bold mb-3">
                    Your Blueprint is Ready ✨
                  </h2>
                  <p className="text-muted-foreground mb-10 max-w-md mx-auto leading-relaxed">
                    We&apos;ve analyzed your input and built a personalized StartupOS workspace with your brand, ICP, revenue model, roadmap, and more.
                  </p>

                  <div className="flex flex-col items-center gap-3">
                    <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground mb-6">
                      <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-400" /> Brand Analysis</span>
                      <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-400" /> ICP Identified</span>
                      <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-400" /> Revenue Model</span>
                      <span className="flex items-center gap-1.5"><Check className="h-3 w-3 text-emerald-400" /> Startup Roast</span>
                    </div>

                    <Button size="xl" className="glow-purple px-12 text-base" onClick={handleFinish} disabled={isSaving}>
                      {isSaving ? "Saving..." : "Enter Workspace"}
                      {!isSaving && <ArrowRight className="h-4 w-4 ml-1" />}
                    </Button>
                  </div>

                  <div className="mt-10 max-w-sm mx-auto">
                    <p className="text-xs text-muted-foreground mb-3">Your Blueprint is based on:</p>
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
                    <span className="text-xs font-medium text-primary uppercase tracking-wider">Question {currentStep + 1} of {steps.length - 1}</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-display font-bold mb-2">{step.title}</h2>
                  <p className="text-muted-foreground mb-10 leading-relaxed">{step.description}</p>

                  <div className="space-y-6">
                    {step.fields.map((field) => {
                      if (field.showIf) {
                        const dependentValue = data[field.showIf.field as keyof InterviewData] as string;
                        if (!field.showIf.is.includes(dependentValue)) return null;
                      }

                      const currentValue = (data[field.id as keyof InterviewData] as string) || "";
                      const fieldId = field.id;

                      return (
                        <div key={field.id}>
                          <label htmlFor={field.id} className="block text-sm font-medium text-foreground mb-2">{field.label}</label>
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

                  <div className="mt-10 flex items-center justify-between">
                    <Button variant="ghost" onClick={prevStep} disabled={currentStep === 0} className="gap-2">
                      <ArrowLeft className="h-4 w-4" /> Back
                    </Button>
                    <Button onClick={nextStep} disabled={!validateStep(step, data)} className="gap-2 glow-purple">
                      Continue <ArrowRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40">
        <div className="mx-auto flex h-12 max-w-5xl items-center justify-center px-6">
          <p className="text-xs text-muted-foreground">StartupOS Beta · Your data stays private</p>
        </div>
      </div>
    </div>
  );
}
