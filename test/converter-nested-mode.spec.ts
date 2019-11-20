import reflect from "tinspector"

import createConverter from "../src"


describe("Nested Model", () => {
    @reflect.parameterProperties()
    class ClientClass {
        constructor(
            public id: number,
            public name: string,
            public join: Date
        ) { }
    }

    @reflect.parameterProperties()
    class AnimalClass {
        constructor(
            public id: number,
            public name: string,
            public deceased: boolean,
            public birthday: Date,
            public owner: ClientClass
        ) { }
    }
    const convert = createConverter({ type: AnimalClass })

    it("Should convert nested model", () => {
        const { value: result } = convert({
            id: "200",
            name: "Mimi",
            deceased: "ON",
            birthday: "2018-2-2",
            owner: { id: "400", name: "John Doe", join: "2015-2-2" }
        })
        expect(result).toBeInstanceOf(AnimalClass)
        expect(result.owner).toBeInstanceOf(ClientClass)
        expect(result).toEqual({
            birthday: new Date("2018-2-2"),
            deceased: true,
            id: 200,
            name: "Mimi",
            owner: { id: 400, name: "John Doe", join: new Date("2015-2-2") }
        })
    })

    it("Should sanitize excess data", () => {
        const { value: result } = convert({
            id: "200",
            name: "Mimi",
            deceased: "ON",
            birthday: "2018-2-2",
            excess: "Malicious Code",
            owner: { id: "400", name: "John Doe", join: "2015-2-2", excess: "Malicious Code" }
        })
        expect(result).toBeInstanceOf(AnimalClass)
        expect(result.owner).toBeInstanceOf(ClientClass)
        expect(result).toEqual({
            birthday: new Date("2018-2-2"),
            deceased: true,
            id: 200,
            name: "Mimi",
            owner: { id: 400, name: "John Doe", join: new Date("2015-2-2") }
        })
    })

    it("Should allow undefined values", () => {
        const { value: result } = convert({
            id: "200",
            name: "Mimi",
            owner: { id: "400", name: "John Doe" }
        })
        expect(result).toBeInstanceOf(AnimalClass)
        expect(result.owner).toBeInstanceOf(ClientClass)
        expect(result).toEqual({
            id: 200,
            name: "Mimi",
            owner: { id: 400, name: "John Doe" }
        })
    })

    it("Should throw if non convertible value provided", () => {
        const result = convert({
            id: "200",
            name: "Mimi",
            deceased: "ON",
            birthday: "2018-2-2",
            owner: { id: "400", name: "John Doe", join: "Hello" }
        })
        expect(result.issues).toEqual([{ path: "owner.join", messages: [`Unable to convert "Hello" into Date`] }])
    })

    it("Should throw if non convertible model provided", () => {
        const result = convert({
            id: "200",
            name: "Mimi",
            deceased: "ON",
            birthday: "2018-2-2",
            owner: "Hello"
        })
        expect(result.issues).toEqual([{ path: "owner", messages: [`Unable to convert "Hello" into ClientClass`] }])
    })
})