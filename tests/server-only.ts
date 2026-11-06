// The test runners import server modules in plain Node, where the real marker package throws
// (it only stands down for a React Server bundler), so Vitest aliases the marker here and
// Playwright reaches it through the tsconfig paths. Next flags the marker by its request
// name, so the build still refuses it in a client module.
export {}
