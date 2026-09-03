DECLARE @__userId_0 int = 1;
DECLARE @__id_1 int = 123;
SELECT TOP(1) [u].[Id], [u].[AiFeedback], [u].[AiScore], [u].[CreatedAt], [u].[ImprovementSuggestionsJson], [u].[PracticeStatus], [u].[QuestionId], [u].[StrengthsJson], [u].[UserAnswer], [u].[UserId], [u].[WeaknessesJson]
FROM [UserQuestionPracticeHistories] AS [u]
WHERE [u].[UserId] = @__userId_0 AND [u].[QuestionId] = @__id_1
ORDER BY [u].[CreatedAt] DESC;
