FROM mcr.microsoft.com/dotnet/sdk:9.0 AS dev
WORKDIR /app

COPY *.csproj ./
RUN dotnet restore

COPY . ./

RUN dotnet tool install --global dotnet-watch
ENV PATH="$PATH:/root/.dotnet/tools"

EXPOSE 5032

CMD ["dotnet", "watch", "run"]
