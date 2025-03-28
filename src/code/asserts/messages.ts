export class AssertMessages {
    private readonly defaultError: string;

    constructor() {
        this.defaultError = "assertion failed.";
    }

    public positive(propVal: number, propName: string): string {
        return `"${propName}" must be positive number but it is: ${propVal}.`;
    }

    public graterThanZero(propVal: number, propName: string): string {
        return `"${propName}" must be grater than 0 but it is: ${propVal}.`;
    }

    public defined(propName: string): string {
        return `'${propName}' cannot be null or undefined.`;
    }

    public alive(className: string): string {
        return `current ${className} instance has been disposed.`;
    }

    public default(): string {
        return this.defaultError;
    }
}

const assertMsg = new AssertMessages();
export default assertMsg;