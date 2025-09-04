using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

namespace anotaki_api.Exceptions
{
	public class GlobalExceptionHandler : IExceptionHandler
	{
		private readonly ILogger<GlobalExceptionHandler> _logger;

		public GlobalExceptionHandler(ILogger<GlobalExceptionHandler> logger)
		{
			_logger = logger;
		}

		public async ValueTask<bool> TryHandleAsync(HttpContext httpContext, Exception exception, CancellationToken cancellationToken)
		{
			_logger.LogError(exception, "Exception occurred: {Message}", exception.Message);

			int statusCode;
			string title;

			switch (exception)
			{
				case CpfDuplicatedException:
					statusCode = StatusCodes.Status409Conflict;
					title = "CPF already exists.";
					break;

				case EmailDuplicatedException:
					statusCode = StatusCodes.Status409Conflict;
					title = "Email already exists.";
					break;

				default:
					return false;
			}

			var problemDetails = new ProblemDetails { Status = statusCode, Title = title };

			httpContext.Response.StatusCode = statusCode;

			await httpContext.Response.WriteAsJsonAsync(problemDetails, cancellationToken);

			return true;
		}
	}
}
