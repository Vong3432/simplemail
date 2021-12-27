export class CancelJobError extends Error {
    constructor(args: string | undefined) {
        super(args)
        this.name = "Cancel Job Error."
    }
}

