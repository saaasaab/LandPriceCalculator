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


            const _path = breadthFirstSearch(nodes, startIndex, endIndex);

            const path = _path.map(nodeIndex=>nodes.find(node=>node.index===nodeIndex) || nodes[0] )
            paths.push({
                start: nodes[startIndex],
                end: nodes[endIndex],
                path,
            });
        }
    }

    return paths;
}



function breadthFirstSearch(
    nodes: TNode[],
    startIndex: number,
    endIndex: number
): number[] {
    const queue: number[] = [startIndex]; // Queue to process nodes
    const cameFrom: Map<number, number> = new Map(); // To reconstruct the path

    // Perform BFS
    while (queue.length > 0) {
        const currentIndex = queue.shift()!; // Dequeue the next node
        const currentNode = nodes[currentIndex];

        // If we reach the end node, reconstruct and return the path
        if (currentIndex === endIndex) {
            return reconstructPathIndexes(cameFrom, currentIndex, startIndex);
        }

        // Process neighbors
        for (const neighborIndex of currentNode.children) {
            if (!cameFrom.has(neighborIndex)) {

                cameFrom.set(neighborIndex, currentIndex); // Track the parent
                queue.push(neighborIndex); // Enqueue the neighbor
            }
        }
    }

    // If no path is found, return an empty array
    return [];
}
// Helper function to reconstruct the path using cameFrom
function reconstructPathIndexes(
    cameFrom: Map<number, number>,
    currentIndex: number,
    startIndex:number
): number[] {
    const path: number[] = [currentIndex];
    const visited: Set<number> = new Set(); // Track visited nodes


    while (cameFrom.has(currentIndex) && currentIndex !== startIndex) {
        if (visited.has(currentIndex)) {
            throw new Error(
                `Circular reference detected while reconstructing the path at node ${currentIndex}`
            );
        }

        visited.add(currentIndex); // Mark the current node as visited
        currentIndex = cameFrom.get(currentIndex)!;
        path.unshift(currentIndex); // Add the parent to the start of the path
    }

    return path;
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

