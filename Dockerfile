# Multi-stage build for Switcher.Api targeting .NET 10
# nixpacks doesn't support .NET 10 yet, so this Dockerfile is required.

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore — copy only csproj first for better layer caching
COPY src/Switcher.Api/Switcher.Api.csproj src/Switcher.Api/
RUN dotnet restore src/Switcher.Api/Switcher.Api.csproj

# Copy the rest and publish
COPY src/ src/
RUN dotnet publish src/Switcher.Api/Switcher.Api.csproj \
    -c Release -o /app/publish --no-restore /p:UseAppHost=false

# Runtime stage
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production
EXPOSE 8080

ENTRYPOINT ["dotnet", "Switcher.Api.dll"]
