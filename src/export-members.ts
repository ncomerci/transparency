import snapshot from '@snapshot-labs/snapshot.js'
import Networks from './entities/Networks'
import { SnapshotSpace } from './interfaces/GovernanceProposal'
import { CATALYSTS, DCLProfile, MemberInfo, STRATEGIES, Vote } from './interfaces/Members'
import { fetchGraphQL, fetchURL, flattenArray, parseVP, saveToCSV, saveToJSON, splitArray } from './utils'

const MAX_RETRIES = 20

const space = SnapshotSpace.DCL
const network = Networks.ETHEREUM.id.toString()
const blockNumber = 'latest'

async function getDCLNames(addresses: string[], idx = 0) {

  const params = new URLSearchParams()

  for (const address of addresses) {
    params.append('id', address)
  }

  const domain = CATALYSTS[idx % CATALYSTS.length]
  const profiles: DCLProfile[] = await fetchURL(`https://${domain}/lambdas/profiles?${params.toString()}`)

  let result: Record<string, string> = {}

  for (const profile of profiles) {
    const partialResult = profile.avatars.reduce((acc, curr) => {
      if (!curr.ethAddress && !curr.userId) {
        return acc
      }
      const address = curr.ethAddress || curr.userId
      return { ...acc, [address.toLowerCase()]: curr.name }
    }, {} as Record<string, string>)
    result = { ...result, ...partialResult }
  }
  return result
}

async function getMembersInfo(addresses: string[], jobId: number) {
  console.log('Started job:', jobId)
  let snapshotScores: { [x: string]: number }[] = []
  let dclNames: Record<string, string> = {}
  let retries = MAX_RETRIES
  do {
    try {
      const dividedAddresses = splitArray(addresses, 100)
      const unresolvedNames = dividedAddresses.map(getDCLNames)
      const [scores, names] = await Promise.all([
        snapshot.utils.getScores(space, STRATEGIES, network, addresses, blockNumber),
        Promise.all(unresolvedNames)
      ])
      snapshotScores = scores
      dclNames = names.reduce((acc, curr) => ({ ...acc, ...curr }), {})
    } catch (e) {
      retries -= 1
      console.log('Error', e)
      console.log(`Job: ${jobId} - Retrying score fetch. Retries left ${retries}...`)
    }
  } while (snapshotScores.length === 0 && retries > 0)

  const info: MemberInfo[] = []

  for (const address of addresses) {
    const scores = [0, 0, 0, 0, 0, 0]
    const name = dclNames[address.toLowerCase()] || ''

    for (const idx in snapshotScores) {
      scores[idx] = snapshotScores[idx][address] || 0
    }

    info.push({
      address,
      name,
      avatar: `https://wearable-preview.decentraland.org/?profile=${address}`,
      ...parseVP(scores)
    })
  }

  console.log(`Job: ${jobId} - Fetched: ${info.length}`)
  return info
}

async function main() {
  // Fetch Snapshot Votes
  const url = 'https://hub.snapshot.org/graphql'
  const where = `space_in: ["${space}"], vp_gt: 10`
  const votes = await fetchGraphQL<Vote>(url, 'votes', where, 'created', 'voter', 20000)

  const members = new Set(votes.map(v => v.voter)) // Unique addresses
  console.log('Total Members:', members.size)

  const dividedAddresses = splitArray(Array.from(members), 2000)
  const info = flattenArray(await Promise.all(dividedAddresses.map(getMembersInfo)))

  saveToJSON('members.json', info)
  saveToCSV('members.csv', info, [
    { id: 'address', title: 'Member' },
    { id: 'name', title: 'DCL Name' },
    { id: 'totalVP', title: 'Total VP' },
    { id: 'manaVP', title: 'MANA VP' },
    { id: 'landVP', title: 'LAND VP' },
    { id: 'namesVP', title: 'NAMES VP' },
    { id: 'delegatedVP', title: 'Delegated VP' },
    { id: 'avatar', title: 'Avatar Preview' }
  ])
}

main()