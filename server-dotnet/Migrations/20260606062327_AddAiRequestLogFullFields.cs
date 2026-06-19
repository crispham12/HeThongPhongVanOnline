using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace InterviewPro.API.Migrations
{
    /// <inheritdoc />
    public partial class AddAiRequestLogFullFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Drop the old TokensUsed column
            migrationBuilder.DropColumn(
                name: "TokensUsed",
                table: "AiRequestLogs");

            // Make UserId nullable
            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "AiRequestLogs",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            // Add new columns
            migrationBuilder.AddColumn<string>(
                name: "Model",
                table: "AiRequestLogs",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "fallback");

            migrationBuilder.AddColumn<int>(
                name: "InputTokens",
                table: "AiRequestLogs",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "OutputTokens",
                table: "AiRequestLogs",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "TotalTokens",
                table: "AiRequestLogs",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<decimal>(
                name: "EstimatedCost",
                table: "AiRequestLogs",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(name: "Model", table: "AiRequestLogs");
            migrationBuilder.DropColumn(name: "InputTokens", table: "AiRequestLogs");
            migrationBuilder.DropColumn(name: "OutputTokens", table: "AiRequestLogs");
            migrationBuilder.DropColumn(name: "TotalTokens", table: "AiRequestLogs");
            migrationBuilder.DropColumn(name: "EstimatedCost", table: "AiRequestLogs");

            migrationBuilder.AlterColumn<int>(
                name: "UserId",
                table: "AiRequestLogs",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddColumn<int>(
                name: "TokensUsed",
                table: "AiRequestLogs",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }
    }
}

