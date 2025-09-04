using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace anotaki_api.Migrations
{
    /// <inheritdoc />
    public partial class AddImageMimeTypeToProduct : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ImageMimeType",
                table: "Products",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ImageMimeType",
                table: "Products");
        }
    }
}
