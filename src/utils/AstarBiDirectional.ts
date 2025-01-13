import { CNode } from "../pages/VisibilityGraph";



export function findShortestPathsAstar(
    nodes: CNode[],
    startIndices: number[],
    startProjectionIndices: number[],
    endIndices: number[]
): { start: CNode; end: CNode; path: CNode[] }[] {
    const paths: { start: CNode; end: CNode; path: CNode[] }[] = [];

    // verifyGraphConnectivity(nodes)
    for (const startIndex of startProjectionIndices) {
        for (const endIndex of endIndices) {

            // if ((endIndex % 2 === 0 && needsBackupIndex) || !needsBackupIndex) {
                const _path = aStar(nodes, startIndex, endIndex);
                const path = _path.map(nodeIndex => nodes.find(node => node.index === nodeIndex.index) || nodes[0])


                // if (endIndex % 2 === 0 && !path) needsBackupIndex = true
                paths.push({
                    start: nodes[startIndex],
                    end: nodes[endIndex],
                    path,
                });
            // }
        }
    }



    // Now connect the starts with eachother.
    if (startProjectionIndices.length > 1) {
        for (const startIndex of startProjectionIndices) {
            for (const startIndex2 of startProjectionIndices) {
                if (startIndex2 <= startIndex) continue;
                // if(startIndex2 === startIndex)
                const _path = aStar(nodes, startIndex, startIndex2);
                const path = _path.map(nodeIndex => nodes.find(node => node.index === nodeIndex.index) || nodes[0])
                paths.push({
                    start: nodes[startIndex],
                    end: nodes[startIndex2],
                    path,
                });
            }

        }
    }


    return paths;
}


function aStar(nodes: CNode[], startIndex: number, endIndex: number): CNode[] {
    const start = nodes[startIndex];
    const end = nodes[endIndex];

    // Open set containing indices of nodes
    const openSet: Set<number> = new Set([startIndex]);

    // Maps for scores and path reconstruction
    const cameFrom: Map<number, number> = new Map();
    const gScore: Map<number, number> = new Map();
    const fScore: Map<number, number> = new Map();

    // Initialize gScore and fScore
    nodes.forEach((node) => {
        gScore.set(node.index, Infinity);
        fScore.set(node.index, Infinity);
    });

    gScore.set(startIndex, 0);
    fScore.set(startIndex, heuristic(start, end));

    while (openSet.size > 0) {
        // Find node with the lowest fScore in the open set

        let currentIndex: number = Array.from(openSet).reduce((a, b) =>
            (fScore.get(a) || Infinity) < (fScore.get(b) || Infinity) ? a : b
        );


        // If we reach the end node, reconstruct the path
        if (currentIndex === endIndex) {
            return reconstructPath(nodes, cameFrom, currentIndex);
        }


        openSet.delete(currentIndex);

        const current = nodes[currentIndex];

        for (const childIndex of current.children) {

            const neighbor = nodes[childIndex];

            // Tentative gScore

            let currentGScore = gScore.get(currentIndex);
            let childFScore = gScore.get(childIndex)

            if (currentGScore === undefined) {
                currentGScore = Infinity
            }


            if (childFScore === undefined) {
                childFScore = Infinity
            }
            const tentativeGScore = currentGScore + distance(current, neighbor);



            if (tentativeGScore < childFScore) {
                // Update path and scores
                cameFrom.set(childIndex, currentIndex);
                gScore.set(childIndex, tentativeGScore);
                fScore.set(childIndex, tentativeGScore + heuristic(neighbor, end));

                // Add neighbor to the open set
                if (!openSet.has(childIndex)) {
                    openSet.add(childIndex);
                }
            }
        }
    }

    // If no path was found
    return [];
}

// Heuristic: Euclidean distance
function heuristic(node1: CNode, node2: CNode): number {
    return Math.sqrt((node1.x - node2.x) ** 2 + (node1.y - node2.y) ** 2);
}

// Distance between two nodes
function distance(node1: CNode, node2: CNode): number {
    return Math.sqrt((node1.x - node2.x) ** 2 + (node1.y - node2.y) ** 2);
}

// Reconstruct the path from the cameFrom map
function reconstructPath(nodes: CNode[], cameFrom: Map<number, number>, currentIndex: number): CNode[] {
    const path: CNode[] = [nodes[currentIndex]];

    while (cameFrom.has(currentIndex)) {
        currentIndex = cameFrom.get(currentIndex)!;
        path.unshift(nodes[currentIndex]);
    }

    return path;
}


function verifyGraphConnectivity(nodes: CNode[]) {
    for (const node of nodes) {
        for (const childIndex of node.children) {
            if (childIndex < 0 || childIndex >= nodes.length) {
                console.error(`Invalid child index ${childIndex} for node ${node.index}`);
            }
        }
    }
    console.log("Graph connectivity verified.");
}

