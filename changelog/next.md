# Unreleased (since v0.0.2 / 2026-07-26)

This changelog tracks changes committed after the v0.0.2 release tag.

## @mbler/mcx-component 0.0.4-rc.2

### fix(mcx-component)

- `EntityComponent.toJSON()` now emits the config object written by `setPhysics(config)`
  (`components['minecraft:physics']`); previously the config was silently dropped and only the
  `physics: boolean` shorthand (emitting an empty `minecraft:physics: {}`) was handled.
  The `hasComponents` detection chain also includes the key so an entity with only a physics
  config still gets a `components` section.
