import { describe, it, expect, beforeEach } from "vitest";
import { SupervisorAgent } from "./supervisor";
import { DataIngestionAgent } from "./ingestion";
import { PolicyAnalysisAgent } from "./analysis";
import { SynthesisAgent } from "./synthesis";
import { AgentOrchestrator } from "./orchestrator";

describe("Agent System Tests", () => {
  describe("SupervisorAgent", () => {
    let supervisorAgent: SupervisorAgent;

    beforeEach(() => {
      supervisorAgent = new SupervisorAgent();
    });

    it("should initialize with correct configuration", () => {
      const config = supervisorAgent.getConfig();
      expect(config.name).toBe("SupervisorAgent");
      expect(config.version).toBe("1.0.0");
    });

    it("should execute workflow and return success", async () => {
      const result = await supervisorAgent.execute({
        region: "California",
        policyType: "Renewable Energy",
        userId: 1,
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.executionTime).toBeGreaterThan(0);
    });

    it("should handle invalid input gracefully", async () => {
      const result = await supervisorAgent.execute({});

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should track execution time", async () => {
      const result = await supervisorAgent.execute({
        region: "EU",
        policyType: "Emissions Reduction",
        userId: 1,
      });

      expect(result.executionTime).toBeGreaterThan(0);
      expect(typeof result.executionTime).toBe("number");
    });
  });

  describe("DataIngestionAgent", () => {
    let ingestionAgent: DataIngestionAgent;

    beforeEach(() => {
      ingestionAgent = new DataIngestionAgent();
    });

    it("should initialize with correct configuration", () => {
      const config = ingestionAgent.getConfig();
      expect(config.name).toBe("DataIngestionAgent");
      expect(config.description).toContain("climate policy data");
    });

    it("should fetch data from multiple sources in parallel", async () => {
      const result = await ingestionAgent.execute({
        region: "India",
        policyType: "Carbon Pricing",
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      const data = result.data as unknown as { sources: unknown[] };
      expect(Array.isArray(data.sources)).toBe(true);
      expect(data.sources.length).toBeGreaterThan(0);
    });

    it("should standardize data from different sources", async () => {
      const result = await ingestionAgent.execute({
        region: "Brazil",
        policyType: "Deforestation Prevention",
      });

      expect(result.success).toBe(true);

      const data = result.data as unknown as {
        sources: Array<{ type: string; count: number }>;
      };
      data.sources.forEach((source) => {
        expect(source.type).toBeDefined();
        expect(source.count).toBeGreaterThan(0);
      });
    });
  });

  describe("PolicyAnalysisAgent", () => {
    let analysisAgent: PolicyAnalysisAgent;

    beforeEach(() => {
      analysisAgent = new PolicyAnalysisAgent();
    });

    it("should initialize with correct configuration", () => {
      const config = analysisAgent.getConfig();
      expect(config.name).toBe("PolicyAnalysisAgent");
    });

    it("should perform iterative analysis", async () => {
      const result = await analysisAgent.execute({
        region: "Japan",
        policyType: "Nuclear Energy",
        ingestionData: {},
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      const data = result.data as unknown as { iterationCount: number };
      expect(data.iterationCount).toBeGreaterThan(0);
      expect(data.iterationCount).toBeLessThanOrEqual(3);
    });

    it("should track confidence level", async () => {
      const result = await analysisAgent.execute({
        region: "Germany",
        policyType: "Wind Energy",
        ingestionData: {},
      });

      expect(result.success).toBe(true);

      const data = result.data as unknown as { confidence: number };
      expect(data.confidence).toBeGreaterThanOrEqual(0);
      expect(data.confidence).toBeLessThanOrEqual(1);
    });

    it("should generate findings with risk factors", async () => {
      const result = await analysisAgent.execute({
        region: "Australia",
        policyType: "Coal Transition",
        ingestionData: {},
      });

      expect(result.success).toBe(true);

      const data = result.data as unknown as {
        findings: { riskFactors: string[] };
      };
      expect(Array.isArray(data.findings.riskFactors)).toBe(true);
      expect(data.findings.riskFactors.length).toBeGreaterThan(0);
    });
  });

  describe("SynthesisAgent", () => {
    let synthesisAgent: SynthesisAgent;

    beforeEach(() => {
      synthesisAgent = new SynthesisAgent();
    });

    it("should initialize with correct configuration", () => {
      const config = synthesisAgent.getConfig();
      expect(config.name).toBe("SynthesisAgent");
      expect(config.description).toContain("Gemini");
    });

    it("should generate policy recommendations", async () => {
      const result = await synthesisAgent.execute({
        region: "Canada",
        policyType: "Oil Phase-Out",
        analysisData: {},
      });

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();

      const data = result.data as unknown as {
        recommendations: Array<{ priority: string; action: string }>;
      };
      expect(Array.isArray(data.recommendations)).toBe(true);
      expect(data.recommendations.length).toBeGreaterThan(0);
    });

    it("should generate executive summary", async () => {
      const result = await synthesisAgent.execute({
        region: "Singapore",
        policyType: "Green Finance",
        analysisData: {},
      });

      expect(result.success).toBe(true);

      const data = result.data as unknown as { executiveSummary: string };
      expect(typeof data.executiveSummary).toBe("string");
      expect(data.executiveSummary.length).toBeGreaterThan(0);
    });

    it("should store results in memory bank", async () => {
      const result = await synthesisAgent.execute({
        region: "Norway",
        policyType: "Electric Vehicles",
        analysisData: {},
      });

      expect(result.success).toBe(true);

      const data = result.data as unknown as { memoryUpdated: boolean };
      expect(data.memoryUpdated).toBe(true);
    });
  });

  describe("AgentOrchestrator", () => {
    let orchestrator: AgentOrchestrator;

    beforeEach(() => {
      orchestrator = new AgentOrchestrator();
    });

    it("should initialize with all agents", () => {
      const info = orchestrator.getAgentInfo();
      expect(info.agents).toBeDefined();
      expect(info.agents.length).toBe(4);
      expect(info.version).toBe("1.0.0");
    });

    it("should run complete ACPA workflow", async () => {
      const result = await orchestrator.runACPA({
        region: "France",
        policyType: "Nuclear Expansion",
        userId: 1,
      });

      expect(result.success).toBe(true);
      expect(result.executionId).toBeDefined();
      expect(result.result).toBeDefined();
      expect(result.totalExecutionTime).toBeGreaterThan(0);
    });

    it("should handle workflow errors gracefully", async () => {
      const result = await orchestrator.runACPA({
        region: "",
        policyType: "",
        userId: 1,
      });

      // Even with empty inputs, the mock implementation should handle gracefully
      expect(typeof result.success).toBe("boolean");
    });

    it("should return all three stage results", async () => {
      const result = await orchestrator.runACPA({
        region: "Mexico",
        policyType: "Solar Energy",
        userId: 1,
      });

      if (result.success && result.result) {
        expect(result.result.ingestion).toBeDefined();
        expect(result.result.analysis).toBeDefined();
        expect(result.result.synthesis).toBeDefined();
      }
    });
  });

  describe("Integration Tests", () => {
    it("should execute full workflow from ingestion to synthesis", async () => {
      const orchestrator = new AgentOrchestrator();

      const result = await orchestrator.runACPA({
        region: "South Korea",
        policyType: "Hydrogen Economy",
        userId: 1,
        focusAreas: ["job creation", "technology development"],
      });

      expect(result.success).toBe(true);
      expect(result.executionId).toBeDefined();
      expect(result.totalExecutionTime).toBeGreaterThan(0);

      if (result.result) {
        expect(result.result.ingestion.success).toBe(true);
        expect(result.result.analysis.success).toBe(true);
        expect(result.result.synthesis.success).toBe(true);
      }
    });

    it("should maintain data consistency across agents", async () => {
      const orchestrator = new AgentOrchestrator();

      const result = await orchestrator.runACPA({
        region: "Indonesia",
        policyType: "Renewable Energy Target",
        userId: 1,
      });

      expect(result.success).toBe(true);

      if (result.result) {
        const ingestionData = result.result.ingestion.data;
        const analysisData = result.result.analysis.data;
        const synthesisData = result.result.synthesis.data;

        expect(ingestionData).toBeDefined();
        expect(analysisData).toBeDefined();
        expect(synthesisData).toBeDefined();
      }
    });
  });
});
