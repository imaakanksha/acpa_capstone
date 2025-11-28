import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Agent Execution History Table
 * Stores records of each agent execution for observability and tracing
 */
export const agentExecutions = mysqlTable("agent_executions", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  agentName: varchar("agentName", { length: 255 }).notNull(),
  status: mysqlEnum("status", ["pending", "running", "completed", "failed"]).default("pending").notNull(),
  input: text("input"),
  output: text("output"),
  error: text("error"),
  executionTime: int("executionTime"), // milliseconds
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type AgentExecution = typeof agentExecutions.$inferSelect;
export type InsertAgentExecution = typeof agentExecutions.$inferInsert;

/**
 * Memory Bank Table
 * Stores long-term memory for agents (past reports, context, user preferences)
 */
export const memoryBank = mysqlTable("memory_bank", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  memoryType: varchar("memoryType", { length: 64 }).notNull(), // e.g., "past_report", "user_context", "policy_preference"
  key: varchar("key", { length: 255 }).notNull(),
  value: text("value").notNull(),
  embedding: text("embedding"), // JSON string of vector embedding for semantic search
  relevanceScore: int("relevanceScore"), // 0-100 score for relevance
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type MemoryBankEntry = typeof memoryBank.$inferSelect;
export type InsertMemoryBankEntry = typeof memoryBank.$inferInsert;

/**
 * Policy Analysis Results Table
 * Stores the results of policy analysis for reference and historical tracking
 */
export const policyAnalysisResults = mysqlTable("policy_analysis_results", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  executionId: int("executionId"),
  region: varchar("region", { length: 255 }).notNull(),
  policyType: varchar("policyType", { length: 255 }).notNull(),
  analysisData: text("analysisData").notNull(), // JSON string of analysis results
  recommendations: text("recommendations").notNull(), // JSON string of policy recommendations
  confidenceScore: int("confidenceScore"), // 0-100 confidence level
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type PolicyAnalysisResult = typeof policyAnalysisResults.$inferSelect;
export type InsertPolicyAnalysisResult = typeof policyAnalysisResults.$inferInsert;

/**
 * User Context Table
 * Stores user-specific context and preferences for the climate policy agent
 */
export const userContexts = mysqlTable("user_contexts", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull().unique(),
  region: varchar("region", { length: 255 }),
  focusAreas: text("focusAreas"), // JSON array of focus areas (e.g., "renewable_energy", "emissions_reduction")
  energyMix: text("energyMix"), // JSON object describing current energy mix
  populationDensity: varchar("populationDensity", { length: 64 }), // e.g., "high", "medium", "low"
  economicContext: text("economicContext"), // JSON object with economic indicators
  preferences: text("preferences"), // JSON object of user preferences
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type UserContext = typeof userContexts.$inferSelect;
export type InsertUserContext = typeof userContexts.$inferInsert;