// `server-only` throws wherever the `react-server` condition is missing, as it is in plain Node.
// The test runners read content outside any bundle, so they load this empty stand-in instead.
export {}
