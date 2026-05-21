using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Tab.Application.Abstractions;

namespace Tab.Api.Controllers;

[ApiController]
[Authorize]
[Route("api/v1/me")]
public class MeController : ControllerBase
{
    private readonly ICurrentUser _currentUser;

    public MeController(ICurrentUser currentUser)
    {
        _currentUser = currentUser;
    }

    [HttpGet]
    public IActionResult Get() => Ok(new { id = _currentUser.Id });
}
