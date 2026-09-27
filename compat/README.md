# Upstream compatibility aliases

Third-party editor plugins (trees, pool, bones, streetscape, environment, webxr, mint)
were written against the upstream `@pascal-app/*` package names. These private
workspace packages keep that import path working by re-exporting the Intersign
packages, so plugins and the host share a single instance of each store/registry.

They are never published. Remove a shim once every plugin imports `@intersign/*`.
