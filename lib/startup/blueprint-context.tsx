"use client";

import { createContext, useContext, useState, useEffect, useCallback, useMemo, useRef, type ReactNode } from "react";
import type { StartupBlueprint } from "@/lib/startup/blueprint";
import type { InterviewData } from "@/lib/types";

// Types for blueprint generation — defined locally to avoid importing server-side modules
// (which would bundle process.env references into the client bundle)
type GenerationMode = "groq" | "deepseek";

interface GenerateApiResponse {
  blueprint: StartupBlueprint;
  mode: GenerationMode;
  report: {
    provider: string;
    model: string;
    durationMs: number;
    outputTokens: number;
    inputTokens: number;
  };
  error: string | null;
}

interface GenerateApiError {
  error: string;
}

interface BlueprintContextValue {
  blueprint: StartupBlueprint | null;
  isLoading: boolean;
  error: string | null;
  generationStatus: "idle" | "generating" | "success" | "error";
  generationMode: GenerationMode | null;
  generationError: string | null;
  generationMessage: string;
  generationMetadata: StartupBlueprint["generationMetadata"] | null;
  /** Load interview data and generate using AI (Groq → DeepSeek) */
  loadInterviewData: (data: InterviewData) => void;
  /** Load a previously saved blueprint from Supabase by ID */
  loadSavedBlueprint: (id: string) => Promise<void>;
  /** Clear all data */
  clearInterviewData: () => void;
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
  generationMessage: "",
  generationMetadata: null,
  loadInterviewData: noop,
  loadSavedBlueprint: noopAsync,
  clearInterviewData: noop,
  interviewData: null,
});

export function BlueprintProvider({ children }: { children: ReactNode }) {
  const [blueprint, setBlueprint] = useState<StartupBlueprint | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [generationStatus, setGenerationStatus] = useState<"idle" | "generating" | "success" | "error">("idle");
  const [generationMode, setGenerationMode] = useState<GenerationMode | null>(null);
  const [generationError, setGenerationError] = useState<string | null>(null);
  const [generationMessage, setGenerationMessage] = useState<string>("");
  const [generationMetadata, setGenerationMetadata] = useState<StartupBlueprint["generationMetadata"] | null>(null);
  const [interviewData, setInterviewData] = useState<InterviewData | null>(null);

  // Tracks whether a saved blueprint is being loaded — prevents wasteful AI regeneration on mount
  const loadingSavedRef = useRef(false);

  // Progressive generation messages for the loading state
  const generationMessages = [
    "Generating your startup blueprint...",
    "Researching competitors...",
    "Building roadmap...",
    "Creating verdict...",
  ];

  const runGenerationMessages = useCallback(() => {
    let i = 0;
    setGenerationMessage(generationMessages[0]);
    const interval = setInterval(() => {
      i++;
      if (i < generationMessages.length) {
        setGenerationMessage(generationMessages[i]);
      }
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  /**
   * Call the server-side blueprint generation API.
   * This runs on the server where process.env.GROQ_API_KEY / DEEPSEEK_API_KEY are available.
   */
  const generateViaApi = useCallback(async (data: InterviewData): Promise<GenerateApiResponse> => {
    const response = await fetch("/api/blueprints/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorBody: GenerateApiError = await response.json().catch(() => ({ error: "Unknown error" }));
      throw new Error(errorBody.error || `Generation API returned ${response.status}`);
    }

    return response.json() as Promise<GenerateApiResponse>;
  }, []);

  const loadInterviewData = useCallback(async (data: InterviewData) => {
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
    setGenerationMessage(generationMessages[0]);
    setError(null);
    setGenerationError(null);
    setGenerationMode(null);

    const clearMessages = runGenerationMessages();

    try {
      const result = await generateViaApi(data);

      clearMessages();
      localStorage.setItem("startupos-founder", JSON.stringify(data));
      setBlueprint(result.blueprint);
      setGenerationMode(result.mode);
      setGenerationError(result.error);
      setGenerationMetadata(result.blueprint.generationMetadata || null);
      setGenerationMessage("");
      setError(null);
      setGenerationStatus("success");
      setIsLoading(false);
    } catch (err) {
      clearMessages();
      const message = err instanceof Error ? err.message : "Failed to generate blueprint.";
      setError(message);
      setBlueprint(null);
      setGenerationStatus("error");
      setGenerationMessage("");
      setIsLoading(false);
    }
  }, [runGenerationMessages, generateViaApi]);

  const loadSavedBlueprint = useCallback(async (id: string) => {
    loadingSavedRef.current = true;
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
      
      const saved = await res.json();

      // Also store interview data for reference
      if (saved.interview_data) {
        setInterviewData(saved.interview_data as InterviewData);
        localStorage.setItem("startupos-founder", JSON.stringify(saved.interview_data));
      }

      // Check if blueprint data exists and is valid
      const blueprintData = saved.blueprint as StartupBlueprint & { _generationMode?: string };
      if (blueprintData && blueprintData.startupName) {
        setBlueprint(blueprintData);
        loadingSavedRef.current = false;

        // Read generation metadata — prefer new field, fall back to legacy _generationMode
        const storedMeta = (blueprintData as unknown as StartupBlueprint).generationMetadata;
        const storedMode = (blueprintData as unknown as Record<string, unknown>)._generationMode as string | undefined;
        const resolvedMode: GenerationMode = storedMode === "groq" || storedMode === "deepseek" ? storedMode : "groq";
        setGenerationMode(resolvedMode);

        // Build fallback metadata for legacy blueprints
        if (storedMeta) {
          setGenerationMetadata(storedMeta);
        } else if (storedMode) {
          setGenerationMetadata({
            provider: resolvedMode,
            model: resolvedMode === "groq" ? "legacy" : "legacy",
            generatedAt: new Date().toISOString(),
            generationTime: 0,
          });
        } else {
          setGenerationMetadata(null);
        }

        setGenerationStatus("success");
      } else if (saved.interview_data) {
        // Blueprint is null (created from interview) — generate it now
        loadingSavedRef.current = false;
        const interviewPayload = saved.interview_data as InterviewData;
        setInterviewData(interviewPayload);
        setGenerationMessage(generationMessages[0]);
        const clearMessages = runGenerationMessages();
        const result = await generateViaApi(interviewPayload);
        clearMessages();
        setBlueprint(result.blueprint);
        setGenerationMode(result.mode);
        setGenerationError(result.error);
        setGenerationMetadata(result.blueprint.generationMetadata || null);
        setGenerationMessage("");
        setGenerationStatus("success");

        // Save the generated blueprint back to Supabase (store mode within blueprint JSON)
        try {
          const blueprintForStorage = {
            ...result.blueprint,
            _generationMode: result.mode,
            generationMetadata: result.blueprint.generationMetadata,
          };
          const saveRes = await fetch("/api/blueprints", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id,
              name: result.blueprint.startupName || "My Startup",
              blueprint: blueprintForStorage,
            }),
          });
          if (!saveRes.ok) {
            console.warn("[BlueprintContext] Failed to persist generated blueprint — auto-save will retry");
          }
        } catch {
          console.warn("[BlueprintContext] Error persisting generated blueprint — auto-save will retry");
        }
      } else {
        throw new Error("Invalid blueprint data.");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to load saved blueprint.";
      setError(message);
      setGenerationStatus("error");
    } finally {
      loadingSavedRef.current = false;
      setIsLoading(false);
    }
  }, [runGenerationMessages, generateViaApi]);

  const clearInterviewData = useCallback(() => {
    localStorage.removeItem("startupos-founder");
    setBlueprint(null);
    setError(null);
    setIsLoading(false);
    setGenerationStatus("idle");
    setGenerationMode(null);
    setGenerationError(null);
    setGenerationMetadata(null);
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

    // Skip localStorage-based regeneration if a saved blueprint is already being loaded.
    // This prevents wasteful AI API calls when navigating to the workspace with a saved blueprint.
    if (loadingSavedRef.current) {
      return;
    }

    try {
      const stored = localStorage.getItem("startupos-founder");
      if (!stored) {
        setIsLoading(false); // eslint-disable-line react-hooks/set-state-in-effect
        setGenerationStatus("idle");
        return;
      }
      const parsed = JSON.parse(stored) as InterviewData;
      setInterviewData(parsed);
      setIsLoading(true);
      setGenerationStatus("generating");
      setGenerationMessage(generationMessages[0]);
      setError(null);
      setGenerationError(null);

      const clearMessages = runGenerationMessages();
      generateViaApi(parsed)
        .then((result: GenerateApiResponse) => {
          setBlueprint(result.blueprint);
          setGenerationMode(result.mode);
          setGenerationError(result.error);
          setGenerationMetadata(result.blueprint.generationMetadata || null);
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
  // eslint-disable-next-line react-hooks/exhaustive-deps -- both have stable identity (useCallback with []) 
  }, [runGenerationMessages, generateViaApi]);

  const value = useMemo<BlueprintContextValue>(
    () => ({
      blueprint,
      isLoading,
      error,
      generationStatus,
      generationMode,
      generationError,
      generationMessage,
      generationMetadata,
      loadInterviewData,
      loadSavedBlueprint,
      clearInterviewData,
      interviewData,
    }),
    [blueprint, isLoading, error, generationStatus, generationMode, generationError, generationMessage, generationMetadata, loadInterviewData, loadSavedBlueprint, clearInterviewData, interviewData],
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
