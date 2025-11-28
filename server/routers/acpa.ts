/**
 * ACPA Router
 * tRPC procedures for the Adaptive Climate Policy Analyst agent system
 */

import { z } from "zod";
import { protectedProcedure, router } from "../_core/trpc";
import { AgentOrchestrator } from "../agents/orchestrator";
import { getDb } from "../db";
import { agentExecutions, policyAnalysisResults } from "../../drizzle/schema";

const orchestrator = new AgentOrchestrator();

export const acpaRouter = router({
  /**
   * Run the complete ACPA workflow
   */
  analyzePolicy: protectedProcedure
    .input(
      z.object({
        region: z.string().min(1, "Region is required"),
        policyType: z.string().min(1, "Policy type is required"),
        focusAreas: z.array(z.string()).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const db = await getDb();
      const startTime = Date.now();

      try {
        // Log execution start
        if (db) {
          await db.insert(agentExecutions).values({
            userId: ctx.user.id,
            agentName: "SupervisorAgent",
            status: "running",
            input: JSON.stringify(input),
          });
        }

        // Run the ACPA workflow
        const result = await orchestrator.runACPA({
          region: input.region,
          policyType: input.policyType,
          userId: ctx.user.id,
          focusAreas: input.focusAreas,
        });

        if (!result.success) {
          throw new Error(result.error || "ACPA workflow failed");
        }

        // Store analysis results
        if (db && result.result?.synthesis.data) {
          const synthesisData = result.result.synthesis.data as unknown as {
            recommendations: unknown[];
            executiveSummary: string;
          };

          await db.insert(policyAnalysisResults).values({
            userId: ctx.user.id,
            region: input.region,
            policyType: input.policyType,
            analysisData: JSON.stringify(result.result.analysis.data || {}),
            recommendations: JSON.stringify(synthesisData.recommendations || []),
            confidenceScore: Math.round(
              ((result.result.analysis.data as unknown as { confidence?: number })?.confidence || 0) * 100
            ),
          });
        }

        const executionTime = Date.now() - startTime;

        return {
          success: true,
          executionId: result.executionId,
          stages: {
            ingestion: result.result?.ingestion,
            analysis: result.result?.analysis,
            synthesis: result.result?.synthesis,
          },
          totalExecutionTime: executionTime,
        };
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);

        // Log execution failure
        if (db) {
          await db.insert(agentExecutions).values({
            userId: ctx.user.id,
            agentName: "SupervisorAgent",
            status: "failed",
            input: JSON.stringify(input),
            error: errorMessage,
            executionTime: Date.now() - startTime,
          });
        }

        throw new Error(`ACPA analysis failed: ${errorMessage}`);
      }
    }),

  /**
   * Get agent system information
   */
  getAgentInfo: protectedProcedure.query(() => {
    return orchestrator.getAgentInfo();
  }),

  /**
   * Get past analysis results for the user
   */
  getPastAnalyses: protectedProcedure
    .input(
      z.object({
        limit: z.number().default(10),
        offset: z.number().default(0),
      })
    )
    .query(async ({ ctx, input }) => {
      const db = await getDb();

      if (!db) {
        return { analyses: [], total: 0 };
      }

      // In a real implementation, we would query the policyAnalysisResults table
      // For now, return mock data
      return {
        analyses: [],
        total: 0,
      };
    }),
});
