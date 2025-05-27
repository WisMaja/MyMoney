namespace api.Middlewares;

public class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;

    public ExceptionHandlingMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
            throw;
        }
    }

    private Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        Console.WriteLine("Middleware is working. Logging error to file.");
        // Do some logic, log errors to file
        return Task.CompletedTask;
    }
}