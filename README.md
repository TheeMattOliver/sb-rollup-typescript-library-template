# My Storybook, React, Typescript and Rollup template

_Note_: This is just my (fairly opinionated) boilerplate config for kickstarting Typescript-React based components library projects. I kept having to configure Rollup, Github Actions, a bundle/type-check/build/type declarations script, tsconfig, etc over and over and over again.

It may not be what you'd do and there's some custom stuff in the Github Actions aimed at working with private npm registries so it may not be exactly what you're looking for.

## Set up

Clone and install dependencies, then get set up for publishing:

1. Update `config.json` in in `/.changeset/config.json` with your repo info
2. Update package name in `package.json`
3. Update library name in `rollup.config.js`
4. Add any env vars, npm tokens, etc needed for Github actions
5. Create Github actions in `.github/workflows`:

`release-snapshot.yml`

```
name: Release snapshot
on:
  push:
    branches-ignore:
      - "main"
      - "changeset-release/**"
      - "dependabot/**"

jobs:
  ci:
    name: CI
    runs-on: ubuntu-latest
    steps:
      - name: Checkout repo
        uses: actions/checkout@main
        with:
          # This makes Actions fetch all Git history so that Changesets
          # can generate changelogs with the correct commits.
          fetch-depth: 0

      # If you use a version of Node other than 12, change it here.
      - name: Set up Node.js 12.x
        uses: actions/setup-node@main
        with:
          node-version: 12.x

      - name: Create .npmrc
        run: |
          cat << EOF > "$HOME/.npmrc"
          init.author.name=Matt Oliver
          init.author.url=https://mattoliver.xyz
          init.author.email=mattoliver.mattoliver@gmail.com
          email=mattoliver.mattoliver@gmail.com
          registry=https://registry.npmjs.org
          always-auth=true
          //registry.npmjs.org/:_authToken=$NPM_TOKEN
          EOF
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

      # If you use npm instead of yarn, change this to `npm install`.
      - name: Install Dependencies
        run: npm config set registry https://registry.npmjs.org &&
          npm config set //registry.npmjs.org/:_authToken=$NPM_TOKEN &&
          npm config set email mattoliver.mattoliver@gmail.com &&
          npm config set _auth $NPM_TOKEN &&
          npm config set always-auth true &&
          yarn --update-checksums
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Build
        run: yarn build

      # Change this to customize your test command.
      # - name: Test
      # run: yarn test

      - name: Release snapshot
        run: |
          npx changeset version --snapshot
          npx changeset publish --tag snapshot
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

      - name: Post published version to GitHub checks
        run: |
          name=$(jq -r .name package.json)
          version=$(jq -r .version package.json)
          npx action-status --context=$name --state=success --description=$version --url="https://unpkg.com/$name@$version/"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

`release.yml`:

```
name: Release

on:
  push:
    branches:
      - main

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    steps:
      - name: Checkout Repo
        uses: actions/checkout@v1
        with:
          # This makes Actions fetch all Git history so that Changesets can generate changelogs with the correct commits
          fetch-depth: 0

      - name: Setup Node.js 12.x
        uses: actions/setup-node@v1
        with:
          node-version: 12.x

      - name: Create .npmrc
        run: |
          cat << EOF > "$HOME/.npmrc"
          init.author.name=Matt Oliver
          init.author.url=https://mattoliver.xyz
          init.author.email=mattoliver.mattoliver@gmail.com
          email=mattoliver.mattoliver@gmail.com
          registry=https://registry.npmjs.org
          always-auth=true
          //registry.npmjs.org/:_authToken=$NPM_TOKEN
          EOF
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Install Dependencies
        run: npm config set registry https://registry.npmjs.org &&
          npm config set //registry.npmjs.org/:_authToken=$NPM_TOKEN &&
          npm config set email mattoliver.mattoliver@gmail.com &&
          npm config set _auth $NPM_TOKEN &&
          npm config set always-auth true &&
          yarn --update-checksums
        env:
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}

      - name: Build
        run: yarn build

      - name: Create Release Pull Request or Publish to npm
        id: changesets
        uses: changesets/action@v1
        with:
          # This expects you to have a script called release which does a build for your packages and calls changeset publish
          publish: yarn release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
```
