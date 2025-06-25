module.exports = {
  source: [
    "package.json",
    "apps/*/package.json",
    "packages/*/package.json"
  ],
  filter: ".",
  semverRange: "",
  sortFirst: [
    "name",
    "version",
    "private",
    "description",
    "author",
    "license",
    "type",
    "main",
    "files",
    "exports",
    "scripts",
    "dependencies",
    "devDependencies",
    "peerDependencies"
  ],
  sortAlong: [
    "dependencies",
    "devDependencies",
    "peerDependencies"
  ],
  versionGroups: [
    {
      label: "Use workspace protocol for internal packages",
      packages: ["**"],
      dependencies: ["@repo/**"],
      isIgnored: true
    }
  ]
}