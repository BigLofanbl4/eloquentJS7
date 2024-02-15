"use strict";

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
    for (let [from, to] of edges.map((r) => r.split("-"))) {
        addEdge(from, to);
        addEdge(to, from);
    }
    return graph;
}

const roadGraph = buildGraph(roads);
// console.log(buildGraph(roads));
// console.log(Object.keys(roadGraph));
// console.log(roadGraph);

class VillageState {
    constructor(place, parcels) {
        this.place = place;
        this.parcels = parcels;
    }

    move(destination) {
        if (!roadGraph[this.place].includes(destination)) {
            return this;
        }
        let parcels = this.parcels
            .map((p) => {
                if (p.place != this.place) return p;
                return { place: destination, adress: p.adress };
            })
            .filter((p) => p.place != p.adress);
        return new VillageState(destination, parcels);
    }
}

let first = new VillageState("Post Office", [
    { place: "Post Office", adress: "Alice's House" },
]);
let next = first.move("Alice's House");
// console.log(next);
// console.log(next.place);
// console.log(first.place);

// let object = Object.freeze({value: 5});
// object.value = 10;
// object.val = 10;
// console.log(object.value);
// console.log(object.val);

function runRobot(state, robot, memory) {
    for (let turn = 0; ; turn++) {
        if (state.parcels.length == 0) {
            console.log(`Completed by ${turn} steps`);
            break;
        }
        let action = robot(state, memory);
        state = state.move(action.direction);
        memory = action.memory;
        console.log(`Transition to ${action.direction}`);
    }
}

function randomPick(array) {
    let choice = Math.floor(Math.random() * array.length);
    return array[choice];
}

function randomRobot(state) {
    return { direction: randomPick(roadGraph[state.place]) };
}

VillageState.random = function (parcelCount = 5) {
    let parcels = [];
    for (let i = 0; i < parcelCount; i++) {
        let adress = randomPick(Object.keys(roadGraph));
        let place;
        do {
            place = randomPick(Object.keys(roadGraph));
        } while (place == adress);
        parcels.push({ place, adress });
    }
    return new VillageState("Post Office", parcels);
};

// runRobot(VillageState.random(), randomRobot);

const mailRoute = [
    "Alice's House",
    "Cabin",
    "Alice's House",
    "Bob's House",
    "Town Hall",
    "Daria's House",
    "Ernie's House",
    "Grete's House",
    "Shop",
    "Grete's House",
    "Farm",
    "Marketplace",
    "Post Office",
];

function routeRobot(state, memory) {
    if (memory.length === 0) {
        memory = mailRoute;
    }
    return { direction: memory[0], memory: memory.slice(1) };
}

// runRobot(VillageState.random(), routeRobot, mailRoute);

function findRoute(graph, from, to) {
    let work = [{ at: from, route: [] }];
    for (let i = 0; i < work.length; i++) {
        let { at, route } = work[i];
        for (let place of graph[at]) {
            if (place == to) return route.concat(place);
            if (!work.some((w) => w.at == place)) {
                work.push({ at: place, route: route.concat(place) });
            }
        }
    }
}

function goalOrientedRobot({ place, parcels }, route) {
    if (route.length == 0) {
        let parcel = parcels[0];
        if (parcel.place != place) {
            route = findRoute(roadGraph, place, parcel.place);
        } else {
            route = findRoute(roadGraph, place, parcel.adress);
        }
    }
    return { direction: route[0], memory: route.slice(1) };
}

function goalOrientedRobot2({ place, parcels }, route) {
    if (route.length == 0) {
        let parcel = findClosestParcelPlace({ place, parcels });
        if (parcel.place != place) {
            route = findRoute(roadGraph, place, parcel.place);
        } else {
            route = findRoute(roadGraph, place, parcel.adress);
        }
    }
    return { direction: route[0], memory: route.slice(1) };
}

function goalOrientedRobot3({ place, parcels }, route) {
    if (route.length == 0) {
        let parcel = findClosestParcelAdress({ place, parcels });
        if (parcel.place != place) {
            route = findRoute(roadGraph, place, parcel.place);
        } else {
            route = findRoute(roadGraph, place, parcel.adress);
        }
    }
    return { direction: route[0], memory: route.slice(1) };
}

function findClosestParcelPlace({ place, parcels }) {
    let closestRoute = findRoute(roadGraph, place, parcels[0].place);
    let parcel = parcels[0];
    for (let i = 0; i < parcels.length; i++) {
        let route = findRoute(roadGraph, place, parcels[i].place);
        if (closestRoute.length > route.length) {
            closestRoute = route;
            parcel = parcels[i];
        }
    }
    return parcel;
}

function findClosestParcelAdress({ place, parcels }) {
    let closestRoute = [];
    let parcel = findClosestParcelPlace({ place, parcels });
    for (let i = 0; i < parcels.length; i++) {
        let route = findRoute(roadGraph, place, parcels[i].adress);
        if (closestRoute.length == 0 && place == parcels[i].place) {
            closestRoute = route;
            parcel = parcels[i];
        } else if (closestRoute.length > route.length) {
            closestRoute = route;
            parcel = parcels[i];
        }
    }
    return parcel;
}

function lazyRobot({ place, parcels }, route) {
    if (route.length == 0) {
        let routes = parcels.map((parcel) => {
            if (parcel.place != place) {
                return {
                    route: findRoute(roadGraph, place, parcel.place),
                    pickUp: true,
                };
            } else {
                return {
                    route: findRoute(roadGraph, place, parcel.adress),
                    pickUp: false,
                };
            }
        });
        function score({ route, pickUp }) {
            return (pickUp ? 0.5 : 0) - route.length;
        }
        route = routes.reduce((a, b) => (score(a) > score(b) ? a : b)).route;
    }

    return { direction: route[0], memory: route.slice(1) };
}

// compareRobots(goalOrientedRobot2, [], lazyRobot, []);

let state = new VillageState.random();

// console.log(findClosestParcelAdress(state));

function compareRobots(robot1, memory1, robot2, memory2) {
    let robot1Turns = 0;
    let robot2Turns = 0;

    function runRobot(state, robot, memory) {
        for (let turn = 0; ; turn++) {
            if (state.parcels.length == 0) {
                return turn;
            }
            let action = robot(state, memory);
            state = state.move(action.direction);
            memory = action.memory;
        }
    }

    for (let taskNum = 0; taskNum < 100; taskNum++) {
        let state = VillageState.random();
        robot1Turns += runRobot(state, robot1, memory1);
        robot2Turns += runRobot(state, robot2, memory2);
    }

    console.log(`Robot1 average ${robot1Turns / 100}`);
    console.log(`Robot2 average ${robot2Turns / 100}`);
}

// compareRobots(routeRobot, [], goalOrientedRobot, []);

// class PGroup {
//     // constructor() {
//     //     this.collection = [];
//     // }

//     add(item) {
//         let newGroup = Object.create(PGroup.empty);
//         if (!newGroup.has(item)) {
//             newGroup.collection = this.collection.concat(item);
//         } else {
//             return this;
//         }        
//         return newGroup;
//     }

//     delete(item) {
//         let newGroup = Object.create(PGroup.empty);
//         if (!this.has(item)) {
//             return this
//         }
//         newGroup.collection = this.collection.slice(0).filter(elem => elem !== item);
//         return newGroup;
//     }

//     has(item) {
//         return this.collection.includes(item);
//     }
// }

// PGroup.empty = new PGroup();
// PGroup.empty.collection = [];

class PGroup {
    constructor(members) {
        this.members = members;
    }

    add(value) {
        if (this.has(value)) return this;
        return new PGroup(this.members.concat([value]));
    }

    delete(value) {
        if (!this.has(value)) return this;
        return new PGroup(this.members.filter(m => m !== value));
    }

    has(value) {
        return this.members.includes(value);
    }
}

PGroup.empty = new PGroup([]);

let a = PGroup.empty.add("a");
let ab = a.add("b");
let b = ab.delete("a");

console.log(b.has("b"));
// → true
console.log(a.has("b"));
// → false
console.log(b.has("a"));
// → false

console.log(a);
console.log(b);
console.log(ab);