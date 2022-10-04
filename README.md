# @chotot/husky - Git Hooks for Chotot Web Projects

> Forked from the renowned tool [Husky](https://github.com/typicode/husky) to skip another [dotfile](https://blog.typicode.com/husky-git-hooks-javascript-config/) being added to the project's repo.

Husky can prevent bad `git commit`, `git push` and more 🐶 _woof!_

### IMPORTANT:

#### pnpm users:

- Husky's postinstall setup script **will not always run automatically** due to pnpm super fast cached installation. It is recommended to include a `prepare: "husky install"` in your repo's root `package.json` scripts.
- This fork was patched to be compatible with `pnpm` >= `v6`.

#### npm users:

- **npm v7 users**: if hooks aren't being installed with npm `v7`, check that your version is at least `v7.1.2`.

## Install

This will install @chotot/husky.

```sh
# npm
npm install @chotot/husky --save-dev

# pnpm
pnpm add --save-dev @chotot/husky
```

```js
// package.json
{
  "husky": {
    "hooks": {
      "pre-commit": "npm test",
      "pre-push": "npm test",
      "...": "..."
    }
  }
}
```

```sh
git commit -m 'Keep calm and commit'
```

_Existing hooks are kept. Requires Node `>= 10` and Git `>= 2.13.0`._

## Reinstall

If Husky is already in your `node_modules` and you want to reinstall hooks, you can run `npx husky install` or `pnpm exec husky install`.

## Uninstall

```sh
npm uninstall @chotot/husky
```

_Git hooks installed by husky will be removed._

## Guides

<!-- toc -->

* [Supported hooks](#supported-hooks)
* [Access Git params and stdin](#access-git-params-and-stdin)
* [Skip all hooks (rebase)](#skip-all-hooks-(rebase))
* [Disable auto-install](#disable-auto-install)
* [CI servers](#ci-servers)
* [Monorepos](#monorepos)
* [Node version managers](#node-version-managers)
* [Local commands (~/.huskyrc)](#local-commands-(~/.huskyrc))
* [Multiple commands](#multiple-commands)
* [Troubleshoot](#troubleshoot)
  * [Debug messages](#debug-messages)
  * [Hooks aren't running](#hooks-aren't-running)
  * [Hooks aren't running with git 2.9+](#hooks-aren't-running-with-git-2.9+)
  * [Commits aren't blocked](#commits-aren't-blocked)
  * [Commits are slow](#commits-are-slow)
  * [Testing husky in a new repo](#testing-husky-in-a-new-repo)
  * [ENOENT error 'node_modules/husky/.git/hooks'](#enoent-error-'node_modules/husky/.git/hooks')

<!-- tocstop -->

### Supported hooks

Husky supports all Git hooks defined [here](https://git-scm.com/docs/githooks). Server-side hooks (`pre-receive`, `update` and `post-receive`) aren't supported.

### Access Git params and stdin

Git hooks can get parameters via command-line arguments and stdin. Husky makes them accessible via `HUSKY_GIT_PARAMS` and `HUSKY_GIT_STDIN` environment variables.

```
"commit-msg": "echo $HUSKY_GIT_PARAMS"
```

### Skip all hooks (rebase)

During a rebase you may want to skip all hooks, you can use `HUSKY_SKIP_HOOKS` environment variable.

```sh
HUSKY_SKIP_HOOKS=1 git rebase ...
```

### Disable auto-install

If you don't want husky to automatically install Git hooks, simply set `HUSKY_SKIP_INSTALL` environment variable.

```sh
HUSKY_SKIP_INSTALL=1 npm install
```

### CI servers

By default, Husky won't install on CI servers.

### Monorepos

If you have a multi-package repository, it's **recommended** to use tools like [lerna](https://github.com/lerna/lerna) and have husky installed ONLY in the root `package.json` to act as the source of truth.

Generally speaking, you should AVOID defining husky in multiple `package.json`, as each package would overwrite previous husky installation.

```sh
.
└── root
    ├── .git
    ├── package.json 🐶 # Add husky here
    └── packages
        ├── A
        │   └── package.json
        ├── B
        │   └── package.json
        └── C
            └── package.json
```

```js
// root/package.json
{
  "private": true,
  "devDependencies": {
    "husky": "..."
  },
  "husky": {
    "hooks": {
      "pre-commit": "lerna run test"
    }
  }
}
```

### Node version managers

If you're on Windows, husky will simply use the version installed globally on your system.

For macOS and Linux users:

- if you're running `git` commands in the terminal, husky will use the version defined in your shell `PATH`. In other words, if you're a `nvm` user, husky will use the version that you've set with `nvm`.
- if you're using a GUI client and `nvm`, it may have a different `PATH` and not load `nvm`, in this case the highest `node` version installed by `nvm` will usually be picked. You can also check `~/.node_path` to see which version is used by GUIs and edit if you want to use something else.

### Local commands (~/.huskyrc)

Husky will source `~/.huskyrc` file if it exists before running hook scripts.
You can use it, for example, to load a node version manager or run some `shell` commands before hooks.

```sh
# ~/.huskyrc
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"
```

### Multiple commands

By design and just like `scripts` defined in `package.json`, husky will run hook scripts as a single command.

```json
"pre-commit": "cmd && cmd"
```

That said, if you prefer to use an array, the recommended approach is to define them in `.huskyrc.js` or `husky.config.js`.

```js
const tasks = (arr) => arr.join(' && ')

module.exports = {
  hooks: {
    'pre-commit': tasks(['cmd', 'cmd']),
  },
}
```

Tools like [npm-run-all](https://github.com/mysticatea/npm-run-all) can help too.

### Troubleshoot

#### Debug messages

`HUSKY_DEBUG=1` can provide additional information when running commands.

```
HUSKY_DEBUG=1 npm install @chotot/husky --save-dev
HUSKY_DEBUG=1 git commit ...
```

#### Hooks aren't running

Check if hooks were installed. Verify that `.git/hooks/pre-commit` exists and have husky code. It should start with:

```sh
#!/bin/sh
# husky...
```

If not, you may have another Git hooks manager defined in your `package.json` overwriting husky's hooks. Check also the output during install, you should see:

```
husky > Setting up git hooks
husky > Done
```

#### Hooks aren't running with git 2.9+

Check if there's `core.hooksPath` config defined in your repo `.git/config` file. In that case, either:

- If the `hooksPath` config was added accidentally, (likely via `npx husky-init`), remove that line in `.git/config` file.
- If `hooksPath` was added by another tool that you are aware of, then it's better to install and use the official [Husky package](https://github.com/typicode/husky)

#### Commits aren't blocked

For a commit to be blocked, `pre-commit` script must exit with a non-zero exit code. If you commit isn't blocked, check your script exit code.

#### Commits are slow

Husky is fast and only adds a few tenth of seconds to commits (`~0.3s` on a low-end PC). So it's most probably related to how many things are done during `pre-commit`. You can often improve this by using cache on your tools (babel, eslint, ...) and using [lint-staged](https://github.com/okonet/lint-staged).

#### Testing husky in a new repo

To isolate your issue, you can also create a new repo:

```sh
mkdir foo && cd foo
git init && npm init -y
npm install @chotot/husky --save-dev

# Add a failing pre-commit hook to your package.json:
# "pre-commit": "echo \"this should fail\" && exit 1"

# Make a commit
```

#### ENOENT error 'node_modules/husky/.git/hooks'

Verify that your version of Git is `>=2.13.0`.

## See also

- [Typicode's husky](https://github.com/typicode/husky) - The original Husky tool
- [Chotot's Web Standards](https://github.com/chototoss/chotot-web-standards) - Chotot's Web Standards

## License

MIT

