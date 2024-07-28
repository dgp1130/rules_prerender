# Read arguments.
$ARGS.named.STAMP as $stamp |
$ARGS.named.DEFAULT_VERSION as $default_version |
($stamp.STABLE_RULES_PRERENDER_VERSION // $default_version) as $version |
$ARGS.named.PACKAGE_FILTER as $package_filter |

# Replace a semver string with the stamped version.
# `0.0.0-PLACEHOLDER` -> `1.2.3`
# `^0.0.0-PLACEHOLDER` -> `^1.2.3`
# `~0.0.0-PLACEHOLDER` -> `~1.2.3`
def replace_version:
  if startswith("^") then
    "^" + $version
  elif startswith("~") then
    "~" + $version
  else
    $version
  end
;

# We need `workspace:` for `pnpm` to resolve local dependencies, but this should
# be stripped for releases.
def strip_workspace:
  if startswith("workspace:") then
    .[("workspace:" | length):]
  else
    .
  end
;

# Takes a dependencies object and replaces the versions of all the dependencies
# matching `$package_filter`.
def map_deps:
  with_entries(
    .key as $key |
    .value |= if $key | test($package_filter) then
      strip_workspace | replace_version
    else
      .
    end
  )
;

# Stamp the `version` property and all the dependencies.
if $version then
  .version = $version |
  if .dependencies then .dependencies |= map_deps else . end |
  if .devDependencies then .devDependencies |= map_deps else . end |
  if .peerDependencies then .peerDependencies |= map_deps else . end |
  if .optionalDependencies then .optionalDependencies |= map_deps else . end
else
  .
end
