# getappmap/analyze-action

GitHub action to analyze the changes between two code revisions.

To see a step-by-step example of how to install this action into your software project, [review the official AppMap Documentation](http://appmap.io/docs/analysis/in-github-actions).

AppMap analysis is performed by comparing two AppMap archives - "base" and "head". The "base" archive is created by the
GitHub Action 
[`getappmap/archive-action`](https://github.com/getappmap/archive-action/blob/main/action.yml) when code is merged to main.
The "head" archive is created by this (analyze) Action. The report generated by this Action includes information such as root cause analysis of failed tests,
a list of API changes, new and resolved analysis findings (anti-patterns and flaws), 
and lists of new and changed AppMaps. This action will also add code annotations to identify
the root cause of failed tests and analysis findings.

## Development

```
# Remove build artifacts
$ yarn clean

# Build the project
$ yarn build

# Run tests
$ yarn test

# Package the project into a distributable GitHub action
$ yarn package
```
