# Shared Test Support

Shared test helpers should be placed here instead of inside individual setupGroup folders.

Recommended subfolders:

- `fixtures/`
- `mocks/`
- `step/`
- `factories/`
- `utils/`

During migration, files in `test/BusinessRule/config/` can be moved here gradually once imports are updated.
