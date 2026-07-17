#!/usr/bin/env bash
set -euo pipefail

project_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$project_dir"
bundle exec jekyll build --destination "$project_dir/dist/client"
mkdir -p "$project_dir/dist/server"
cp "$project_dir/sites/worker/index.js" "$project_dir/dist/server/index.js"

test -f "$project_dir/dist/client/index.html"
test -f "$project_dir/dist/server/index.js"
node --check "$project_dir/dist/server/index.js"
