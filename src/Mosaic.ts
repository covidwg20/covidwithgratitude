import { OmHooks } from 'OmHooks';

/**
 *
 */
export class Mosaic {

    public readonly baseElem: HTMLElement;

    public constructor() {
        const baseElem = document.createElement("div");
        baseElem.classList.add(
            OmHooks.Mosaic.Class.BASE,
        );
        this.baseElem = baseElem;
    }
}
Object.freeze(Mosaic);
Object.freeze(Mosaic.prototype);
