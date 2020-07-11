namespace DatingApp.API.Helper
{
    public class PaginationHeader
    {
        public int CurrentPage { get; set; }
        public int TotalPages { get; set; }
        public int ItemsPerPage { get; set; }
        public int TotalItems { get; set; }

        public PaginationHeader(int currentPage, int itemsPerPage, int totalItems, int totalPages)
        {
            CurrentPage = currentPage;
            TotalPages = totalPages;
            TotalItems = totalItems;
            ItemsPerPage = itemsPerPage;
        }
    }
}