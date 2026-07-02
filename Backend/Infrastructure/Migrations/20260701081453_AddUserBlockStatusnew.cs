using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUserBlockStatusnew : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ConversationParticipants_AspNetUsers_UserId1",
                table: "ConversationParticipants");

            migrationBuilder.DropIndex(
                name: "IX_ConversationParticipants_UserId1",
                table: "ConversationParticipants");

            migrationBuilder.DropColumn(
                name: "UserId1",
                table: "ConversationParticipants");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "UserId1",
                table: "ConversationParticipants",
                type: "uuid",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ConversationParticipants_UserId1",
                table: "ConversationParticipants",
                column: "UserId1");

            migrationBuilder.AddForeignKey(
                name: "FK_ConversationParticipants_AspNetUsers_UserId1",
                table: "ConversationParticipants",
                column: "UserId1",
                principalTable: "AspNetUsers",
                principalColumn: "Id");
        }
    }
}
