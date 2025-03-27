export class Assert {
    private readonly globalErrorMessage: string;

    constructor() {
        this.globalErrorMessage = "Assertion failed.";
    }

    public that(condition: unknown, errorMessage: string): asserts condition {
        if (!condition) {
            const errMsg = errorMessage || this.globalErrorMessage;
            throw new Error(errMsg);
        }
    }

    public isDefined<T>(val: T, valName: string): asserts val is NonNullable<T> {
        const errMsg = `'${valName}' cannot be undefined.`;
        this.that(val !== undefined && val !== null, errMsg);
    }
}

const assert: Assert = new Assert();
export default assert;