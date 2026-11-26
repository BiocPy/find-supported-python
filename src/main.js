import * as core from '@actions/core'
import * as github from '@actions/github'

export async function run() {
  try {
    const resp = await fetch('https://endoflife.date/api/python.json')
    if (!resp.ok) {
      throw new Error(
        'failed to fetch Python EOL information (' + resp.statusText + ')'
      )
    }

    const payload = await resp.json()

    const when = core.getInput('when')
    let cutoff
    if (when == '') {
      cutoff = new Date()
    } else {
      cutoff = new Date(when)
      if (isNaN(cutoff)) {
        throw new Error("invalid date specified in 'when'")
      }
    }

    const supported = []
    for (const vinfo of payload) {
      if (new Date(vinfo.eol) >= cutoff && new Date(vinfo.releaseDate) <= cutoff) {
        const vparts = vinfo.cycle.split('.')
        supported.push([Number(vparts[0]), Number(vparts[1])])
      }
    }

    supported.sort((a, b) => {
      if (a[0] == b[0]) {
        return a[1] > b[1]
      } else {
        return a[0] > b[0]
      }
    })

    const create_output = (x) => {
      return String(x[0]) + '.' + String(x[1])
    }

    const which = core.getInput('which')
    if (which == 'latest' || which == 'oldest') {
      if (supported.length == 0) {
        throw new Error("no supported versions at the specified 'when'")
      }
      core.setOutput('version', create_output(supported[which == 'latest' ? 0 : supported.length - 1]))
    } else if (which == 'all') {
      core.setOutput('version', JSON.stringify(supported.map(create_output)))
    } else {
      throw new Error("'which' must be one of 'latest', 'oldest' or 'all'")
    }
  } catch (error) {
    // Fail the workflow step if an error occurs
    core.setFailed(error.message)
  }
}
