CREATE TABLE `agent_executions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`agentName` varchar(255) NOT NULL,
	`status` enum('pending','running','completed','failed') NOT NULL DEFAULT 'pending',
	`input` text,
	`output` text,
	`error` text,
	`executionTime` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `agent_executions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `memory_bank` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`memoryType` varchar(64) NOT NULL,
	`key` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`embedding` text,
	`relevanceScore` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `memory_bank_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `policy_analysis_results` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`executionId` int,
	`region` varchar(255) NOT NULL,
	`policyType` varchar(255) NOT NULL,
	`analysisData` text NOT NULL,
	`recommendations` text NOT NULL,
	`confidenceScore` int,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `policy_analysis_results_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user_contexts` (
	`id` int AUTO_INCREMENT NOT NULL,
	`userId` int NOT NULL,
	`region` varchar(255),
	`focusAreas` text,
	`energyMix` text,
	`populationDensity` varchar(64),
	`economicContext` text,
	`preferences` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `user_contexts_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_contexts_userId_unique` UNIQUE(`userId`)
);
