using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Switcher.Api.Endpoints;

namespace Switcher.Tests;

public class ConvertEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly WebApplicationFactory<Program> _factory;

    public ConvertEndpointTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory.WithWebHostBuilder(b =>
        {
            b.UseSetting("ConnectionStrings:Default", "");
            b.UseSetting("Bot:Token", "");
        });
    }

    [Fact]
    public async Task Convert_NormalText_Returns200()
    {
        var client = _factory.CreateClient();
        var res = await client.PostAsJsonAsync("/api/convert",
            new { text = "ghbdtn", languages = new[] { "en", "ru" } });

        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        var body = await res.Content.ReadFromJsonAsync<ConvertEndpoint.ConvertResponse>();
        Assert.NotNull(body);
        Assert.True(body!.Swapped);
        Assert.Equal("привет", body.Result);
    }

    [Fact]
    public async Task Convert_AtMaxLength_Returns200()
    {
        var client = _factory.CreateClient();
        var text = new string('a', ConvertEndpoint.MaxTextLength);
        var res = await client.PostAsJsonAsync("/api/convert",
            new { text, languages = new[] { "en", "ru" } });

        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
    }

    [Fact]
    public async Task Convert_OverMaxLength_Returns413()
    {
        var client = _factory.CreateClient();
        var text = new string('a', ConvertEndpoint.MaxTextLength + 1);
        var res = await client.PostAsJsonAsync("/api/convert",
            new { text, languages = new[] { "en", "ru" } });

        Assert.Equal(HttpStatusCode.RequestEntityTooLarge, res.StatusCode);
    }

    [Fact]
    public async Task Convert_NullText_Returns400()
    {
        var client = _factory.CreateClient();
        var res = await client.PostAsJsonAsync("/api/convert",
            new { text = (string?)null, languages = new[] { "en", "ru" } });

        Assert.Equal(HttpStatusCode.BadRequest, res.StatusCode);
    }

    [Fact]
    public async Task Languages_ReturnsRegisteredLayouts()
    {
        var client = _factory.CreateClient();
        var res = await client.GetAsync("/api/languages");
        Assert.Equal(HttpStatusCode.OK, res.StatusCode);
        var langs = await res.Content.ReadFromJsonAsync<LanguagesEndpoint.LanguageDto[]>();
        Assert.NotNull(langs);
        Assert.Contains(langs!, l => l.Id == "en");
        Assert.Contains(langs!, l => l.Id == "ru");
    }
}
