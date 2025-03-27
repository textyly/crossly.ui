export class AssertMessages {
    private readonly defaultError: string;

    constructor() {
        this.defaultError = "Assertion failed.";
    }

    public positive(propVal: number, propName: string): string {
        return `"${propName}" must be positive number but it is: ${propVal}.`;
    }

    public graterThanZero(propVal: number, propName: string): string {
        return `"${propName}" must be grater than 0 but it is: ${propVal}.`;
    }

    public undefined(propName: string): string {
        return `'${propName}' cannot be null or undefined.`;
    }

    public default(): string {
        return this.defaultError;
    }
}

const assertMsg = new AssertMessages();
export default assertMsg;