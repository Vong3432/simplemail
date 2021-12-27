export class InvalidJobIdError extends Error {
    constructor(args: string | undefined) {
        super(args)
        this.name = "Invalid Job ID Error"
    }
}

