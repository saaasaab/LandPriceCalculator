import { CNode } from "../pages/VisibilityGraph";

type NodeType = "startProjectionNode" | "endNode" | "midNode" | "startNode";

interface SteinerPathBase {
    terminals: CNode[];
    steinerPoints: CNode[];
    connections: [CNode, CNode][];
}

// Calculate the Euclidean distance between two nodes
function calculateDistance(nodeA: CNode, nodeB: CNode): number {
    const dx = nodeA.x - nodeB.x;
    const dy = nodeA.y - nodeB.y;
    return Math.sqrt(dx * dx + dy * dy);
}

// Calculate the total cost (length) of the tree
function calculateTreeCost(tree: SteinerPathBase): number {
    return tree.connections.reduce((total, [nodeA, nodeB]) => {
        return total + calculateDistance(nodeA, nodeB);
    }, 0);
}

// Generate a random neighbor by adding or removing connections or Steiner points
function generateNeighbor(tree: SteinerPathBase): SteinerPathBase {
    const newTree: SteinerPathBase = JSON.parse(JSON.stringify(tree)); // Deep clone the tree

    const randomChoice = Math.random();
    if (randomChoice < 0.5 && newTree.steinerPoints.length > 0) {
        // Add or remove a random Steiner point connection
        const steinerPoint = newTree.steinerPoints[Math.floor(Math.random() * newTree.steinerPoints.length)];
        const randomTerminal = newTree.terminals[Math.floor(Math.random() * newTree.terminals.length)];

        // Add or remove a connection
        const connection: [CNode, CNode] = [steinerPoint, randomTerminal];
        const existingIndex = newTree.connections.findIndex(
            ([a, b]) => (a.index === connection[0].index && b.index === connection[1].index) ||
                        (a.index === connection[1].index && b.index === connection[0].index)
        );

        if (existingIndex >= 0) {
            newTree.connections.splice(existingIndex, 1); // Remove the connection
        } else {
            newTree.connections.push(connection); // Add a new connection
        }
    } else if (randomChoice >= 0.5 && newTree.steinerPoints.length > 0) {
        // Remove a random Steiner point and its connections
        const steinerPointIndex = Math.floor(Math.random() * newTree.steinerPoints.length);
        const steinerPoint = newTree.steinerPoints[steinerPointIndex];

        // Remove all connections involving this Steiner point
        newTree.connections = newTree.connections.filter(([a, b]) => a.index !== steinerPoint.index && b.index !== steinerPoint.index);

        // Remove the Steiner point
        newTree.steinerPoints.splice(steinerPointIndex, 1);
    }

    return newTree;
}

// Simulated Annealing
export function simulatedAnnealing(
    initialTree: SteinerPathBase,
    initialTemperature: number = 1000,
    coolingRate: number = 0.99,
    iterationsPerTemp: number = 100
): SteinerPathBase {
    let currentTree = initialTree;
    let bestTree = initialTree;
    let currentCost = calculateTreeCost(currentTree);
    let bestCost = currentCost;
    let temperature = initialTemperature;

    while (temperature > 1) {
        for (let i = 0; i < iterationsPerTemp; i++) {
            const neighborTree = generateNeighbor(currentTree);
            const neighborCost = calculateTreeCost(neighborTree);

            const costDifference = neighborCost - currentCost;

            // Accept the new tree if it's better or with a certain probability if it's worse
            if (costDifference < 0 || Math.random() < Math.exp(-costDifference / temperature)) {
                currentTree = neighborTree;
                currentCost = neighborCost;

                // Update the best solution
                if (currentCost < bestCost) {
                    bestTree = currentTree;
                    bestCost = currentCost;
                }
            }
        }

        // Decrease the temperature
        temperature *= coolingRate;
    }

    return bestTree;
}

// // Example Usage
// const initialSteinerTree: SteinerPathBase = {
//     terminals: [/* Array of terminal nodes */],
//     steinerPoints: [/* Array of Steiner points */],
//     connections: [/* Initial connections */]
// };

// const optimizedSteinerTree = simulatedAnnealing(initialSteinerTree);
// console.log("Optimized Steiner Tree:", optimizedSteinerTree);
