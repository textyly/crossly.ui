import { expect } from "chai";
import { ConfigFactory } from "../../../src/code/config/factory.js";

describe('config factory', () => {
    it('returns canvas config different than undefined', () => {
        const configFactory = new ConfigFactory();
        const config = configFactory.create();

        expect(config).not.equal(undefined);
    });
});