using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace anotaki_api.Migrations
{
    /// <inheritdoc />
    public partial class ChangeOrderModels : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Addresses_AddressId",
                table: "Orders");

            migrationBuilder.RenameColumn(
                name: "Note",
                table: "Orders",
                newName: "Notes");

            migrationBuilder.RenameColumn(
                name: "id",
                table: "OrderExtraItems",
                newName: "Id");

            migrationBuilder.AlterColumn<int>(
                name: "AddressId",
                table: "Orders",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "OrderProductItems",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Addresses_AddressId",
                table: "Orders",
                column: "AddressId",
                principalTable: "Addresses",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Orders_Addresses_AddressId",
                table: "Orders");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "OrderProductItems");

            migrationBuilder.RenameColumn(
                name: "Notes",
                table: "Orders",
                newName: "Note");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "OrderExtraItems",
                newName: "id");

            migrationBuilder.AlterColumn<int>(
                name: "AddressId",
                table: "Orders",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_Orders_Addresses_AddressId",
                table: "Orders",
                column: "AddressId",
                principalTable: "Addresses",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
