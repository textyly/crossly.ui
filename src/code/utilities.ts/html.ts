import assert from "../asserts/assert.js";

export class HTMLElementProvider {

    public getById<TElement extends Element>(container: Element, id: string): TElement {
        const element = container.querySelector(`#${id}`);
        assert.defined(element, "element");
        return element as TElement;
    }

    public getByClass<TElement extends Element>(container: Element, selector: string): TElement {
        const element = container.querySelector(`.${selector}`);
        assert.defined(element, "element");
        return element as TElement;
    }
}

export default new HTMLElementProvider();