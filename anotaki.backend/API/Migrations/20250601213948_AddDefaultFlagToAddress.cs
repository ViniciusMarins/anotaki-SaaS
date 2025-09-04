using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace anotaki_api.Migrations
{
    /// <inheritdoc />
    public partial class AddDefaultFlagToAddress : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "IsStandard",
                table: "Addresses",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "IsStandard",
                table: "Addresses");
        }
    }
}
