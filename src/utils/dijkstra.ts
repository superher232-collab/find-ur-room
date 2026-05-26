export interface GraphNode {
  id: string
  label: string
  x: number
  y: number
  floor: number
  type: 'entrance' | 'junction' | 'room' | 'stair' | 'lift'
  instruction?: string
}

export interface GraphEdge {
  from: string
  to: string
  weight: number
  direction?: 'straight' | 'turn_left' | 'turn_right' | 'arrive'
}

export interface RouteResult {
  path: GraphNode[]
  totalWeight: number
}

export function findShortestPath(
  nodes: GraphNode[],
  edges: GraphEdge[],
  startId: string,
  endId: string
): RouteResult | null {
  if (!startId || !endId) return null
  if (startId === endId) {
    const node = nodes.find((n) => n.id === startId)
    return node ? { path: [node], totalWeight: 0 } : null
  }

  // Create adjacency list for undirected graph
  const adjacencyList: Record<string, { node: string; weight: number }[]> = {}
  
  for (const node of nodes) {
    adjacencyList[node.id] = []
  }

  for (const edge of edges) {
    if (adjacencyList[edge.from] && adjacencyList[edge.to]) {
      adjacencyList[edge.from].push({ node: edge.to, weight: edge.weight })
      adjacencyList[edge.to].push({ node: edge.from, weight: edge.weight })
    }
  }

  const distances: Record<string, number> = {}
  const previous: Record<string, string | null> = {}
  const unvisited = new Set<string>()

  for (const node of nodes) {
    distances[node.id] = Infinity
    previous[node.id] = null
    unvisited.add(node.id)
  }
  distances[startId] = 0

  while (unvisited.size > 0) {
    let closestNode: string | null = null
    let minDistance = Infinity

    unvisited.forEach((nodeId) => {
      if (distances[nodeId] < minDistance) {
        minDistance = distances[nodeId]
        closestNode = nodeId
      }
    })

    if (closestNode === null || distances[closestNode] === Infinity) {
      break
    }

    if (closestNode === endId) {
      break
    }

    unvisited.delete(closestNode)

    const neighbors = adjacencyList[closestNode] || []
    for (const neighbor of neighbors) {
      if (!unvisited.has(neighbor.node)) continue
      const alt = distances[closestNode] + neighbor.weight
      if (alt < distances[neighbor.node]) {
        distances[neighbor.node] = alt
        previous[neighbor.node] = closestNode
      }
    }
  }

  if (distances[endId] === Infinity) {
    return null
  }

  const pathIds: string[] = []
  let current: string | null = endId
  while (current !== null) {
    pathIds.unshift(current)
    current = previous[current]
  }

  // Map path IDs to complete GraphNode objects
  const pathNodes = pathIds.map((id) => nodes.find((n) => n.id === id)!)

  return {
    path: pathNodes,
    totalWeight: distances[endId]
  }
}
