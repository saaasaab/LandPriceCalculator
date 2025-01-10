export type TNode = {
    x: number;
    y: number;
    parent: null;
    children: number[]; // Indices of connected nodes
    index: number;
    nodeType: string;
};



export function findShortestPaths(
    nodes: TNode[],
    startIndices: number[],
    endIndices: number[]
): { start: TNode; end: TNode; path: TNode[] }[] {
    const paths: { start: TNode; end: TNode; path: TNode[] }[] = [];

    verifyGraphConnectivity(nodes)


    for (const startIndex of startIndices) {
        for (const endIndex of endIndices) {

            
            const path = aStar(nodes, startIndex, endIndex);

            paths.push({
                start: nodes[startIndex],
                end: nodes[endIndex],
                path,
            });
        }
    }

    return paths;
}


export function aStar(nodes: TNode[], startIndex: number, endIndex: number): TNode[] {
    const start = nodes[startIndex];
    const end = nodes[endIndex];

    const openSet: Set<number> = new Set([startIndex]);
    const cameFrom: Map<number, number> = new Map();

    const gScore: Map<number, number> = new Map();
    const fScore: Map<number, number> = new Map();

    // Initialize gScore and fScore for all nodes
    nodes.forEach((node) => {
        gScore.set(node.index, Infinity);
        fScore.set(node.index, Infinity);
    });

    gScore.set(startIndex, 0);
    fScore.set(startIndex, heuristic(start, end));

    while (openSet.size > 0) {
        // Find the node in openSet with the lowest fScore
        let currentIndex = Array.from(openSet).reduce((a, b) =>
            (fScore.get(a) || Infinity) < (fScore.get(b) || Infinity) ? a : b
        );

        console.log(`Current node: ${currentIndex}`);

        // If we reach the end node, reconstruct and return the path
        if (currentIndex === endIndex) {
            return reconstructPath(nodes, cameFrom, currentIndex);
        }

        openSet.delete(currentIndex);
        const currentNode = nodes[currentIndex];

        for (const neighborIndex of currentNode.children) {
            const neighborNode = nodes[neighborIndex];

            const tentativeGScore =
                (gScore.get(currentIndex) || Infinity) +
                distance(currentNode, neighborNode);

            if (tentativeGScore < (gScore.get(neighborIndex) || Infinity)) {
                // Update scores and path
                cameFrom.set(neighborIndex, currentIndex);
                gScore.set(neighborIndex, tentativeGScore);
                fScore.set(
                    neighborIndex,
                    tentativeGScore + heuristic(neighborNode, end)
                );

                if (!openSet.has(neighborIndex)) {
                    openSet.add(neighborIndex);
                    console.log(`Adding neighbor: ${neighborIndex}`);
                }
            }
        }
    }

    console.warn("Path not found!");
    return [];
}


function verifyGraphConnectivity(nodes: TNode[]) {
    for (const node of nodes) {
        for (const childIndex of node.children) {
            if (childIndex < 0 || childIndex >= nodes.length) {
                console.error(`Invalid child index ${childIndex} for node ${node.index}`);
            }
        }
    }
    console.log("Graph connectivity verified.");
}

// Heuristic: Euclidean distance
function heuristic(node1: TNode, node2: TNode): number {
    return Math.sqrt((node1.x - node2.x) ** 2 + (node1.y - node2.y) ** 2);
}

// Distance between two nodes
function distance(node1: TNode, node2: TNode): number {
    return Math.sqrt((node1.x - node2.x) ** 2 + (node1.y - node2.y) ** 2);
}

// Reconstruct the path from the cameFrom map
function reconstructPath(nodes: TNode[], cameFrom: Map<number, number>, currentIndex: number): TNode[] {
    const path: TNode[] = [nodes[currentIndex]];
    while (cameFrom.has(currentIndex)) {
        currentIndex = cameFrom.get(currentIndex)!;
        path.unshift(nodes[currentIndex]);
    }
    console.log("Reconstructed path:", path.map((node) => node.index));
    return path;
}

