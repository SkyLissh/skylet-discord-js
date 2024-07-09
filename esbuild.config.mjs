import esbuild from "esbuild";

await esbuild.build({
  entryPoints: ["src/**/*.ts"],
  bundle: true,
  platform: "node",
  format: "esm",
  minify: true,
  outdir: "dist",
  packages: "external",
});
