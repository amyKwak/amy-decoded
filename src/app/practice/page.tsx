public class OrderService
{
    private readonly IOrderRepository _repo;
    private readonly ILogger<OrderService> _logger;
 
    public OrderService(IOrderRepository repo, ILogger<OrderService> logger)
    {
        _repo = repo;
        _logger = logger;
    }
 
    public async Task<IReadOnlyList<OrderDto>> GetActiveOrdersAsync(
        string customerId,
        CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrEmpty(customerId);
 
        var orders = await _repo.GetByCustomerAsync(customerId, cancellationToken);
 
        _logger.LogInformation(
            "Retrieved {Count} orders for customer {CustomerId}",
            orders.Count, customerId);
 
        return orders
            .Where(o => o.Status != OrderStatus.Cancelled)
            .Select(o => new OrderDto(o.Id, o.Total, o.CreatedAt))
            .ToList()
            .AsReadOnly();
    }
}