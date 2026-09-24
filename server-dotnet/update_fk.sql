BEGIN TRANSACTION;
GO

CREATE INDEX [IX_InterviewAnalysisJobs_AnalysisResultId] ON [InterviewAnalysisJobs] ([AnalysisResultId]);
GO

CREATE INDEX [IX_InterviewAnalysisJobs_SessionId] ON [InterviewAnalysisJobs] ([SessionId]);
GO

CREATE INDEX [IX_HrInterviewQuestions_QuestionBankId] ON [HrInterviewQuestions] ([QuestionBankId]);
GO

CREATE INDEX [IX_FullMockSessions_UserId] ON [FullMockSessions] ([UserId]);
GO

ALTER TABLE [AiRequestLogs] ADD CONSTRAINT [FK_AiRequestLogs_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]);
GO

ALTER TABLE [FullMockSessions] ADD CONSTRAINT [FK_FullMockSessions_Users_UserId] FOREIGN KEY ([UserId]) REFERENCES [Users] ([Id]) ON DELETE CASCADE;
GO

ALTER TABLE [HrInterviewQuestions] ADD CONSTRAINT [FK_HrInterviewQuestions_HrQuestionBanks_QuestionBankId] FOREIGN KEY ([QuestionBankId]) REFERENCES [HrQuestionBanks] ([Id]);
GO

ALTER TABLE [InterviewAnalysisJobs] ADD CONSTRAINT [FK_InterviewAnalysisJobs_HrInterviewSessions_SessionId] FOREIGN KEY ([SessionId]) REFERENCES [HrInterviewSessions] ([Id]) ON DELETE CASCADE;
GO

ALTER TABLE [InterviewAnalysisJobs] ADD CONSTRAINT [FK_InterviewAnalysisJobs_InterviewAnalysisResults_AnalysisResultId] FOREIGN KEY ([AnalysisResultId]) REFERENCES [InterviewAnalysisResults] ([Id]);
GO

INSERT INTO [__EFMigrationsHistory] ([MigrationId], [ProductVersion])
VALUES (N'20260920071620_AddMissingForeignKeys', N'8.0.11');
GO

COMMIT;
GO

