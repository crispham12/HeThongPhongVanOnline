using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

#pragma warning disable CA1814 // Prefer jagged arrays over multidimensional

namespace InterviewPro.API.Migrations
{
    /// <inheritdoc />
    public partial class AddCreditsAndSePaySystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "CreditHistories",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ChangeAmount = table.Column<int>(type: "int", nullable: false),
                    BalanceAfter = table.Column<int>(type: "int", nullable: false),
                    Type = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ReferenceId = table.Column<Guid>(type: "uniqueidentifier", nullable: true),
                    Description = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CreditHistories", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CreditHistories_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CreditPackages",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(256)", maxLength: 256, nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Credits = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CreditPackages", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "CreditWallets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    FreeCredits = table.Column<int>(type: "int", nullable: false),
                    PaidCredits = table.Column<int>(type: "int", nullable: false),
                    TotalCreditsUsed = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CreditWallets", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CreditWallets_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "CreditPaymentTransactions",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    PackageId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Amount = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    Credits = table.Column<int>(type: "int", nullable: false),
                    PaymentCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PaymentMethod = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Status = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    SePayTransactionId = table.Column<string>(type: "nvarchar(450)", nullable: true),
                    BankCode = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    BankAccountNumber = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TransferContent = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    PaidAt = table.Column<DateTime>(type: "datetime2", nullable: true),
                    ExpiredAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_CreditPaymentTransactions", x => x.Id);
                    table.ForeignKey(
                        name: "FK_CreditPaymentTransactions_CreditPackages_PackageId",
                        column: x => x.PackageId,
                        principalTable: "CreditPackages",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_CreditPaymentTransactions_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.InsertData(
                table: "CreditPackages",
                columns: new[] { "Id", "CreatedAt", "Credits", "IsActive", "Name", "Price", "UpdatedAt" },
                values: new object[,]
                {
                    { new Guid("11111111-1111-1111-1111-111111111111"), new DateTime(2026, 6, 25, 9, 24, 29, 392, DateTimeKind.Utc).AddTicks(1286), 10, true, "Gói 10 lượt", 35000m, null },
                    { new Guid("22222222-2222-2222-2222-222222222222"), new DateTime(2026, 6, 25, 9, 24, 29, 392, DateTimeKind.Utc).AddTicks(1302), 25, true, "Gói 25 lượt", 75000m, null },
                    { new Guid("33333333-3333-3333-3333-333333333333"), new DateTime(2026, 6, 25, 9, 24, 29, 392, DateTimeKind.Utc).AddTicks(1305), 50, true, "Gói 50 lượt", 100000m, null }
                });

            migrationBuilder.CreateIndex(
                name: "IX_CreditHistories_UserId",
                table: "CreditHistories",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditPaymentTransactions_PackageId",
                table: "CreditPaymentTransactions",
                column: "PackageId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditPaymentTransactions_PaymentCode",
                table: "CreditPaymentTransactions",
                column: "PaymentCode",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_CreditPaymentTransactions_SePayTransactionId",
                table: "CreditPaymentTransactions",
                column: "SePayTransactionId",
                unique: true,
                filter: "[SePayTransactionId] IS NOT NULL");

            migrationBuilder.CreateIndex(
                name: "IX_CreditPaymentTransactions_UserId",
                table: "CreditPaymentTransactions",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_CreditWallets_UserId",
                table: "CreditWallets",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "CreditHistories");

            migrationBuilder.DropTable(
                name: "CreditPaymentTransactions");

            migrationBuilder.DropTable(
                name: "CreditWallets");

            migrationBuilder.DropTable(
                name: "CreditPackages");
        }
    }
}
