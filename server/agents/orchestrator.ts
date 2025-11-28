/**
 * Agent Orchestrator
 * Main entry point for running the ACPA multi-agent system
 */

import { SupervisorAgent, SupervisorInput } from "./supervisor";
import { DataIngestionAgent } from "./ingestion";
import { PolicyAnalysisAgent } from "./analysis";
import { SynthesisAgent } from "./synthesis";
import { AgentOutput } from "./base";

export interface ACPARequest {
  region: string;
  policyType: string;
  userId: number;
  focusAreas?: string[];
}

export interface ACPAResponse {
  success: boolean;
  executionId?: string;
  result?: {
    ingestion: AgentOutput;
    analysis: AgentOutput;
    synthesis: AgentOutput;
  };
  totalExecutionTime?: number;
  error?: string;
}

export class AgentOrchestrator {
  private supervisorAgent: SupervisorAgent;
  private ingestionAgent: DataIngestionAgent;
  private analysisAgent: PolicyAnalysisAgent;
  private synthesisAgent: SynthesisAgent;

  constructor() {
    this.supervisorAgent = new SupervisorAgent();
    this.ingestionAgent = new DataIngestionAgent();
    this.analysisAgent = new PolicyAnalysisAgent();
    this.synthesisAgent = new SynthesisAgent();
  }

  /**
   * Run the complete ACPA workflow
   */
  async runACPA(request: ACPARequest): Promise<ACPAResponse> {
    console.log("[AgentOrchestrator] Starting ACPA workflow", request);

    try {
      const supervisorInput: SupervisorInput = {
        region: request.region,
        policyType: request.policyType,
        userId: request.userId,
        focusAreas: request.focusAreas,
      };

      const result = await this.supervisorAgent.execute(supervisorInput as unknown as { [key: string]: unknown });

      if (!result.success) {
        return {
          success: false,
          error: result.error,
        };
      }

      const data = result.data as { executionId: string; stages: { ingestion: AgentOutput; analysis: AgentOutput; synthesis: AgentOutput }; totalExecutionTime: number };

      return {
        success: true,
        executionId: data?.executionId,
        result: data ? {
          ingestion: data.stages.ingestion,
          analysis: data.stages.analysis,
          synthesis: data.stages.synthesis,
        } : undefined,
        totalExecutionTime: data?.totalExecutionTime,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      console.error("[AgentOrchestrator] ACPA workflow failed:", errorMessage);

      return {
        success: false,
        error: errorMessage,
      };
    }
  }

  /**
   * Get information about available agents
   */
  getAgentInfo() {
    return {
      agents: [
        this.supervisorAgent.getConfig(),
        this.ingestionAgent.getConfig(),
        this.analysisAgent.getConfig(),
        this.synthesisAgent.getConfig(),
      ],
      description: "Adaptive Climate Policy Analyst (ACPA) - Multi-Agent System",
      version: "1.0.0",
    };
  }
}
