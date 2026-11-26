# Find supported Python versions

![CI](https://github.com/BiocPy/find-supported-python/actions/workflows/ci.yml/badge.svg)
![Coverage](./badges/coverage.svg)

Finds the currently supported (i.e., non-EOL) versions of Python. 
This ensures that CI workflows will automatically test Python code on supported versions,
without requiring manual reconfiguration to add new versions or remove EOL versions.

## Usage

### Inputs

- `which` - Which supported versions to obtain.
  This can be `latest` (default), `oldest` or `all`.
- `when` - The date to use for determining supported versions.
  This should follow a `YYYY-MM-DD` format.
  Defaults to an empty string, which will use the current date.
 
### Outputs

- `version` - The requested version.
  For `latest` or `oldest`, this is a single string specifying the version.
  For `all`, it is a string containing a JSON array of versions sorted from latest to oldest.

## Examples

Switch between the latest and oldest supported Python versions:

```yaml
name: Using most extreme supported Pythons

on: push

jobs:
  build:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        which-python: [ 'latest', 'oldest' ]

    steps:
    - uses: actions/checkout@v7

    - uses: BiocPy/find-supported-python@v1
      id: find-version
      with:
        which: ${{ matrix.which-python }}

    - name: Set up Python
      uses: actions/setup-python@v6
      with:
        python-version: ${{ steps.find-version.outputs.version }}
```

Use all currently supported Python versions:

```yaml
name: Using all supported Pythons

jobs:
  find:
    runs-on: ubuntu-latest
    outputs:
      version: ${{ steps.find-version.outputs.version }}
    steps:
    - uses: BiocPy/find-supported-python@v1
      id: find-version
      with:
        which: 'all'

  build:
    runs-on: ubuntu-latest
    needs: find
    strategy:
      matrix:
        version: ${{ fromJSON(needs.find.outputs.version) }}

    steps:
    - uses: actions/checkout@v7

    - name: Set up Python
      uses: actions/setup-python@v6
      with:
        python-version: ${{ matrix.version }}
```
