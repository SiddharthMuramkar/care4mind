// A font file imported with `with { turbopackModuleType: 'asset' }` is its URL.
declare module '*.woff2' {
  const url: string
  export default url
}
