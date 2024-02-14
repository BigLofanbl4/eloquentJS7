// "use strict";

const roads = [
    "Alice's House-Bob's House",
    "Alice's House-Cabin",
    "Alice's House-Post Office",
    "Bob's House-Town Hall",
    "Daria's House-Ernie's House",
    "Daria's House-Town Hall",
    "Ernie's House-Grete's House",
    "Grete's House-Farm",
    "Grete's House-Shop",
    "Marketplace-Farm",
    "Marketplace-Post Office",
    "Marketplace-Shop",
    "Marketplace-Town Hall",
    "Shop-Town Hall",
];


// function buildGraph(edges) {
//     const graph = Object.create(null);
//     function addEdge(from, to) {
//         if (!(road[0] in graph)) {
//             graph[from] = [to];
//         } else {
//             graph[from].push(to);
//         }
//     }
//     for (let i = 0; i < edges.length; i++) {
//         let road = edges[i].split("-");
//         addEdge(road[0], road[1]);
//         addEdge(road[1], road[0]);
//     }
// }

function buildGraph(edges) {
    let graph = Object.create(null);
    function addEdge(from, to) {
        if (graph[from] == null) {
            graph[from] = [to];
        } else {
            graph[from].push(to);
        }
    }
    for (let [from, to] of edges.map(r => r.split("-"))) {
        addEdge(from, to);
        addEdge(to, from);
    }
    return graph;
}

const roadGraph = buildGraph(roads);
// console.log(buildGraph(roads));

class VillageState {
    constructor(place, parcels) {
        this.place = place;
        this.parcels = parcels;
    }

    move(destination) {
        if (!roadGraph[this.place].includes(destination)) {
            return this;
        }
        let parcels = this.parcels.map(p => {
            if (p.place != this.place) return p;
            return {place: destination, adress: p.adress};
        }).filter(p => p.place != p.adress);
        return new VillageState(destination, parcels);
    }
}

let first = new VillageState(
    "Post Office",
    [{place: "Post Office", adress: "Alice's House"}]
);
let next = first.move("Alice's House");
// console.log(next);
// console.log(next.place);
// console.log(first.place);

// let object = Object.freeze({value: 5});
// object.value = 10;
// object.val = 10;
// console.log(object.value);
// console.log(object.val);