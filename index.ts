import { routes } from "./src/routes";

const server = Bun.serve({
  port: 3000,
  routes,
  development: {
    hmr: true,
  },
});

console.log(`Server running at http://localhost:${server.port}`);
