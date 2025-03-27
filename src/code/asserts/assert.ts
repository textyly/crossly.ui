import assertMsg from "./messages.js";

export class Assert {

    public positive(propValue: number, propName: string): void {
        const message = assertMsg.positive(propValue, propName);
        this.that(propValue >= 0, message);
    }

    public greaterThanZero(propValue: number, propName: string): void {
        const message = assertMsg.graterThanZero(propValue, propName);
        this.that(propValue > 0, message);
    }

    public that(condition: unknown, errorMessage: string): asserts condition {
        if (!condition) {
            const errMsg = errorMessage;
            throw new Error(errMsg);
        }
    }

    public isDefined<T>(val: T, propName: string): asserts val is NonNullable<T> {
        const defined = val !== undefined && val !== null;
        this.that(defined, assertMsg.undefined(propName));
    }
}

const assert: Assert = new Assert();
export default assert;