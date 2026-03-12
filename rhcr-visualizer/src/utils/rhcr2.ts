export function mulberry32(a: number) {
    return function() {
        var t = a += 0x6D2B79F5;
        t = Math.imul(t ^ t >>> 15, t | 1);
        t ^= t + Math.imul(t ^ t >>> 7, t | 61);
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    }
}

export function f_Frog(x: number, y: number): number {
    const term1 = Math.sqrt(Math.abs(x + y + 1));
    const term2 = Math.sqrt(Math.abs(y - x + 1));
    
    const part1 = x * Math.cos(term1) * Math.sin(term2);
    const part2 = (1 + y) * Math.sin(term1) * Math.cos(term2);
    
    return part1 + part2;
}

export type Point = { x: number, y: number };
export type StepData = {
    currentPoint: Point;
    currentVal: number;
    neighbors: Point[];
    bestNeighbor: Point | null;
    bestNeighborVal: number;
    iteration: number;
    fCalls: number;
    isFinished: boolean;
};

export function* RHCR2_Generator(
    startX: number, 
    startY: number, 
    p: number, 
    z: number, 
    seed: number
): Generator<StepData, StepData, void> {
    const prng = mulberry32(seed);

    let currentPoint = { x: startX, y: startY };
    let currentVal = f_Frog(currentPoint.x, currentPoint.y);
    let fCalls = 1;
    let iteration = 0;
    
    const max_iterations = 1000; // Capped for visualizer to prevent infinite loops

    for (let i = 0; i < max_iterations; i++) {
        iteration = i;
        let bestNeighbor: Point | null = null;
        let bestNeighborVal = currentVal;
        
        const neighbors: Point[] = [];

        for (let j = 0; j < p; j++) {
            const z1 = (prng() * 2 * z) - z;
            const z2 = (prng() * 2 * z) - z;
            
            let nx = currentPoint.x + z1;
            let ny = currentPoint.y + z2;
            
            nx = Math.max(-512.0, Math.min(512.0, nx));
            ny = Math.max(-512.0, Math.min(512.0, ny));
            
            neighbors.push({ x: nx, y: ny });

            const n_val = f_Frog(nx, ny);
            fCalls += 1;
            
            if (n_val < bestNeighborVal) {
                bestNeighborVal = n_val;
                bestNeighbor = { x: nx, y: ny };
            }
        }

        yield {
            currentPoint,
            currentVal,
            neighbors,
            bestNeighbor,
            bestNeighborVal,
            iteration,
            fCalls,
            isFinished: bestNeighbor === null
        };

        if (bestNeighbor !== null) {
            currentPoint = bestNeighbor;
            currentVal = bestNeighborVal;
        } else {
            break;
        }
    }

    return {
        currentPoint,
        currentVal,
        neighbors: [],
        bestNeighbor: null,
        bestNeighborVal: currentVal,
        iteration,
        fCalls,
        isFinished: true // Mark as finished here as well
    };
}
