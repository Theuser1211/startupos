"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, type ReactNode } from "react";
import type { StartupBlueprint } from "@/lib/startup/blueprint";
import { generateBlueprintOrchestrator, type GenerationMode, type GenerationResult } from "@/lib/ai/engine/orchestrator";
import type { InterviewData } from "@/lib/types";

interface BlueprintContextValue {
  blueprint: StartupBlueprint | null;
  isLoading: boolean;
  error: string | null;
  generationStatus: "idle" | "generating" | "success" | "error";
  generationMode: GenerationMode | null;
  generationError: string | null;
  /** Load interview data and generate using the deterministic engine */
  loadInterviewData: (data: InterviewData) => void;
  /** Generate blueprint using AI (with deterministic fallback) */
  generateWithAI: (data: InterviewData) => Promise<void>;
  /** Load a previously saved blueprint from Supabase by ID */
  loadSavedBlueprint: (id: string) => Promise<void>;
  /** Clear all data */
  clearInterviewData: () => void;
  /** Current mode being used */
  isDebugMode: boolean;
  /** The last used interview data */
  interviewData: InterviewData | null;
}

const noop = () => {};
const noopAsync = async () => {};

const BlueprintContext = createContext<BlueprintContextValue>({
  blueprint: null,
  isLoading: true,
  error: null,
  generationStatus: "idle",
  generationMode: null,
  generationError: null,
  loadInterviewData: noop,
  generateWithAI: noopAsync,
  loadSavedBlueprint: noopAsync,
  clearInterviewData: noop,
  isDebugMode: false,
  interviewData: null,
});

export function BlueprintProvider({ children }: { children: ReactNode }) {
  const [blueprint, setBlueprint] = useState<StartupBlueprint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<"idle" | "generating" | "success" | "error">("idle");
  const [generationMode, setGenerationMode] = useState<GenerationMode | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);

  const loadInterviewData = useCallback((data: InterviewData) => {
    if (!data.idea || !data.stage || !data.industry) {
      setError("Incomplete interview data.");
      setBlueprint(null);
      setIsLoading(false);
      setGenerationStatus("error");
      setInterviewData(data);
      return;
    }

    setInterviewData(data);
    setIsLoading(true);
    setGenerationStatus("generating");
    setError(null);
    setGenerationError(null);
    setGenerationMode(null);

    generateBlueprintOrchestrator(data, { mode: "deterministic" })
      .then((result: GenerationResult) => {
        localStorage.setItem("startupos-founder", JSON.stringify(data));
        setBlueprint(result.blueprint);
        setGenerationMode(result.mode);
        setGenerationError(result.error);
        setError(null);
        setGenerationStatus("success");
        setIsLoading(false);
      })
      .catch((err) => {
        const message = err instanceof Error ? err.message : "Failed to generate blueprint.";
        setError(message);
        setBlueprint(null);
        setGenerationStatus("error");
        setIsLoading(false);
      });
  }, []);

  const generateWithAI = useCallback(async (data: InterviewData) => {
    if (!data.idea || !data.stage || !data.industry) {
      setError("Incomplete interview data.");
      setBlueprint(null);
      setGenerationStatus("error");
      setInterviewData(data);
      return;
    }

    setInterviewData(data);
    setIsLoading(true);
    setGenerationStatus("generating");
    setError(null);
    setGenerationError(null);
    setGenerationMode(null);

    try {
      const result = await generateBlueprintOrchestrator(data, {
        mode: "ai",
        fallbackOnFailure: true,
      });

      localStorage.setItem("startupos-founder", JSON.stringify(data));
      setBlueprint(result.blueprint);
      setGenerationMode(result.mode);
      setGenerationError(result.error);
      setError(null);
      setGenerationStatus("success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "AI generation failed.";
      setError(message);
      setGenerationStatus("error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadSavedBlueprint = useCallback(async (id: string) => {
    setIsLoading(true);
    setGenerationStatus("generating");
    setError(null);

    try {
      const res = await fetch(`/api/blueprints?id=${id}`);
      
      // Handle authentication errors specifically
      if (res.status === 401) {
        throw new Error("Please sign in to access this blueprint.");
      }
      
      if (!res.ok) {
        throw new Error("Blueprint not found or has been deleted.");
      }
      
      const data = await res.json();

      // The blueprint data is stored as a plain object — parse and validate
      const blueprintData = data.blueprint as StartupBlueprint;
      if (!blueprintData || !blueprintData.startupName) {
        throw new Error("Invalid blueprint data.");
      }

      // Also store interview data for reference
      if (data.interview_data) {
        setInterviewData(data.interview_data as InterviewData);
        localStorage.setItem("startupos-founder", JSON.stringify(data.interview_data));
      }

      setBlueprint(blueprintData);
      setGenerationMode("deterministic");
      setGenerationStatus("success");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load saved blueprint.";
      setError(message);
      setGenerationStatus("error");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearInterviewData = useCallback(() => {
    localStorage.removeItem("startupos-founder");
    setBlueprint(null);
    setError(null);
    setIsLoading(false);
    setGenerationStatus("idle");
    setGenerationMode(null);
    setGenerationError(null);
    setInterviewData(null);
  }, []);

  useEffect(() => {
    // One-time migration from sessionStorage to localStorage
    try {
      const legacy = sessionStorage.getItem("startupos-founder");
      if (legacy && !localStorage.getItem("startupos-founder")) {
        localStorage.setItem("startupos-founder", legacy);
        sessionStorage.removeItem("startupos-founder");
      }
    } catch {
      // Migration is best-effort
    }

    try {
      const stored = localStorage.getItem("startupos-founder");
      if (!stored) {
        setIsLoading(false);
        setGenerationStatus("idle");
        return;
      }
      const parsed = JSON.parse(stored) as InterviewData;
      setInterviewData(parsed);
      setIsLoading(true);
      setGenerationStatus("generating");
      setError(null);
      setGenerationError(null);

      // Use deterministic engine on initial load for speed and reliability.
      // User can click "Generate with AI" in the debug section to try AI.
      generateBlueprintOrchestrator(parsed, { mode: "deterministic" })
        .then((result: GenerationResult) => {
          setBlueprint(result.blueprint);
          setGenerationMode(result.mode);
          setGenerationError(result.error);
          setGenerationStatus("success");
          setIsLoading(false);
        })
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Failed to generate blueprint from stored data.");
          setGenerationStatus("error");
          setIsLoading(false);
        });
    } catch {
      setError("Failed to parse stored interview data.");
      setIsLoading(false);
      setGenerationStatus("error");
    }
  }, []);

  const value = useMemo<BlueprintContextValue>(
    () => ({
      blueprint,
      isLoading,
      error,
      generationStatus,
      generationMode,
      generationError,
      loadInterviewData,
      generateWithAI,
      loadSavedBlueprint,
      clearInterviewData,
      isDebugMode: false,
      interviewData,
    }),
    [blueprint, isLoading, error, generationStatus, generationMode, generationError, loadInterviewData, generateWithAI, loadSavedBlueprint, clearInterviewData, interviewData],
  );

  return (
    <BlueprintContext.Provider value={value}>
      {children}
    </BlueprintContext.Provider>
  );
}

export function useBlueprint(): BlueprintContextValue {
  return useContext(BlueprintContext);
}
