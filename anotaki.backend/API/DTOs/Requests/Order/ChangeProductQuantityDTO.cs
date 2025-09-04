namespace anotaki_api.DTOs.Requests.Order
{
    public class ChangeProductQuantityDTO
    {
        public int ItemId { get; set; }
        public ChangeProductQuantityOperations Operation { get; set; }
    }

    public enum ChangeProductQuantityOperations
    {
        Add,
        Sub
    }
}
