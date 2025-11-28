/**
 * Base Agent Class
 * Provides the foundation for all agents in the ACPA system
 */

export interface AgentInput {
  [key: string]: unknown;
}

export interface AgentOutput {
  success: boolean;
  data?: unknown;
  error?: string;
  executionTime?: number;
}

export interface AgentConfig {
  name: string;
  description: string;
  version: string;
}

export abstract class BaseAgent {
  protected config: AgentConfig;
  protected logger: Console;

  constructor(config: AgentConfig) {
    this.config = config;
    this.logger = console;
  }

  /**
   * Execute the agent with given input
   */
  abstract execute(input: AgentInput): Promise<AgentOutput>;

  /**
   * Validate input before execution
   */
  protected validateInput(input: AgentInput): boolean {
    if (!input || typeof input !== "object") {
      this.logger.error(`[${this.config.name}] Invalid input: must be an object`);
      return false;
    }
    return true;
  }

  /**
   * Log agent activity
   */
  protected log(level: "info" | "error" | "warn", message: string, data?: unknown) {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${this.config.name}]`;
    
    if (level === "info") {
      this.logger.log(`${prefix} INFO: ${message}`, data || "");
    } else if (level === "error") {
      this.logger.error(`${prefix} ERROR: ${message}`, data || "");
    } else if (level === "warn") {
      this.logger.warn(`${prefix} WARN: ${message}`, data || "");
    }
  }

  /**
   * Get agent configuration
   */
  getConfig(): AgentConfig {
    return this.config;
  }
}
