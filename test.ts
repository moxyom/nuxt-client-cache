interface Item {
    name: string, 
    sub?: Cartesian
}

type Cartesian = Item[][]

const get: Cartesian  = [
    [
        { 
            name: "", 
            sub: [
                [
                    { name: "" },
                    { name: "with custom id field" },
                    { 
                        name: "with custom search",
                        sub: [
                            [
                                { name: "" },
                                { name: "with wrong search function configuration" }
                            ]
                        ]
                    },
                ]
            ] 
        },
        { 
            name: "with foreign", 
            sub: [
                [
                    { name: "" },
                    { name: "with foreign custom id field" },
                    { name: "with custom search on foreign" },
                ],
            ]
        },
        { name: "with recursif foreign" }
    ],[
        { name: "" },
        { name: "when error returned by fetch" },
        { name: "with update for reactivity" },
    ]
]

const subset: Cartesian = [
    [
        { name: "" },
        { name: "with update for reactivity" },
    ],
    [
        { name: "" },
        { name: "with error returned by subset" },
        { name: "when error returned by fetch" },
    ],
    [
        { name: "" },
        { name: "with foreign" }
    ],
]

function cartesianProduct(cartesian: Cartesian): string[][] {

    let names: string[][] = [[]]

    for (const enumm of cartesian) {
        const namesAfterEnum: string[][] = []
        
        for (const oldNames of names) {
            for (const newItem of enumm) {

                const itemCartesianNames = newItem.sub 
                    ? cartesianProduct(newItem.sub).map(names => [...names, newItem.name])
                    : [[ newItem.name ]]

                for (const itemNames of itemCartesianNames) {
                    namesAfterEnum.push([...oldNames, ...itemNames])
                }
            }
            
        }

        names = namesAfterEnum
    }

    return names.map(enumm => enumm.filter(v => v.length > 0))

}

const getTests = cartesianProduct(get)
const subsetTests = cartesianProduct(subset)

console.log(JSON.stringify({
    total: getTests.length + subsetTests.length,
    get: getTests,
    subsets: subsetTests,
}, null, 4))
