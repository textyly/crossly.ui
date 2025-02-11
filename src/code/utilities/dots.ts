export class DotsUtility<TDot> {
    // TODO: add dot equality

    public ensureDots(from: TDot | undefined, to: TDot | undefined): { from: TDot, to: TDot } {
        if (!from) {
            throw new Error("`from` dot must exist.");
        }

        if (!to) {
            throw new Error("`to` dot must exist.");
        }

        const dots = { from, to };
        return dots;
    }
}