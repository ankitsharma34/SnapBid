const localHosts = new Set(["localhost", "127.0.0.1", "::1", "[::1]"]);

export const assertSafeTestDatabaseUrl = (databaseUrl) => {
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for integration tests");
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("Integration tests cannot run with NODE_ENV=production");
  }

  const url = new URL(databaseUrl);
  const databaseName = decodeURIComponent(url.pathname.replace(/^\//, ""));

  if (!localHosts.has(url.hostname)) {
    throw new Error("Integration tests require a local PostgreSQL host");
  }

  if (url.port !== "55432") {
    throw new Error(
      "Integration tests require the dedicated PostgreSQL port 55432",
    );
  }

  if (!databaseName.endsWith("_test")) {
    throw new Error("Integration test database name must end with _test");
  }

  if (databaseName === "snapbid" || databaseName === "postgres") {
    throw new Error("Refusing to use a development or administrative database");
  }

  return url;
};
