using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace anotaki_api.Migrations
{
    /// <inheritdoc />
    public partial class ChangeExtraItemModal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "TotalPrice",
                table: "OrderExtraItems",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<decimal>(
                name: "UnitPrice",
                table: "OrderExtraItems",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "TotalPrice",
                table: "OrderExtraItems");

            migrationBuilder.DropColumn(
                name: "UnitPrice",
                table: "OrderExtraItems");
        }
    }
}
