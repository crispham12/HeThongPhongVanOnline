using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterviewPro.API.Migrations
{
    /// <inheritdoc />
    public partial class AddMissingForeignKeys : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateIndex(
                name: "IX_InterviewAnalysisJobs_AnalysisResultId",
                table: "InterviewAnalysisJobs",
                column: "AnalysisResultId");

            migrationBuilder.CreateIndex(
                name: "IX_InterviewAnalysisJobs_SessionId",
                table: "InterviewAnalysisJobs",
                column: "SessionId");

            migrationBuilder.CreateIndex(
                name: "IX_HrInterviewQuestions_QuestionBankId",
                table: "HrInterviewQuestions",
                column: "QuestionBankId");

            migrationBuilder.CreateIndex(
                name: "IX_FullMockSessions_UserId",
                table: "FullMockSessions",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_AiRequestLogs_Users_UserId",
                table: "AiRequestLogs",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_FullMockSessions_Users_UserId",
                table: "FullMockSessions",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_HrInterviewQuestions_HrQuestionBanks_QuestionBankId",
                table: "HrInterviewQuestions",
                column: "QuestionBankId",
                principalTable: "HrQuestionBanks",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_InterviewAnalysisJobs_HrInterviewSessions_SessionId",
                table: "InterviewAnalysisJobs",
                column: "SessionId",
                principalTable: "HrInterviewSessions",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_InterviewAnalysisJobs_InterviewAnalysisResults_AnalysisResultId",
                table: "InterviewAnalysisJobs",
                column: "AnalysisResultId",
                principalTable: "InterviewAnalysisResults",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_AiRequestLogs_Users_UserId",
                table: "AiRequestLogs");

            migrationBuilder.DropForeignKey(
                name: "FK_FullMockSessions_Users_UserId",
                table: "FullMockSessions");

            migrationBuilder.DropForeignKey(
                name: "FK_HrInterviewQuestions_HrQuestionBanks_QuestionBankId",
                table: "HrInterviewQuestions");

            migrationBuilder.DropForeignKey(
                name: "FK_InterviewAnalysisJobs_HrInterviewSessions_SessionId",
                table: "InterviewAnalysisJobs");

            migrationBuilder.DropForeignKey(
                name: "FK_InterviewAnalysisJobs_InterviewAnalysisResults_AnalysisResultId",
                table: "InterviewAnalysisJobs");

            migrationBuilder.DropIndex(
                name: "IX_InterviewAnalysisJobs_AnalysisResultId",
                table: "InterviewAnalysisJobs");

            migrationBuilder.DropIndex(
                name: "IX_InterviewAnalysisJobs_SessionId",
                table: "InterviewAnalysisJobs");

            migrationBuilder.DropIndex(
                name: "IX_HrInterviewQuestions_QuestionBankId",
                table: "HrInterviewQuestions");

            migrationBuilder.DropIndex(
                name: "IX_FullMockSessions_UserId",
                table: "FullMockSessions");
        }
    }
}
