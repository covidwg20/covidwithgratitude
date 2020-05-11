const SVG_NSPS   = "http://www.w3.org/2000/svg";
const XLINK_NSPS = "http://www.w3.org/1999/xlink";

// TODO if repo moves to organization, update link.
const GITHUB_RAW = (window.origin != "null") ? ""
    : "https://raw.githubusercontent.com/david-fong/CovidWithGratitude/dev/";

async function makeRequest(url: string, method: string = "GET"): Promise<XMLHttpRequest> {
    var request = new XMLHttpRequest();
    return new Promise<XMLHttpRequest>((resolve, reject): void => {
        request.onreadystatechange = () => {
            if (request.readyState !== 4) return;
            if (request.status >= 200 && request.status < 300) {
                resolve(request);
            } else {
                reject(request);
            }
        };
        request.open(method, url);
        request.send();
    });
};


let __CURRENT_SCREEN: ScreenDesc = undefined!;
const SCREEN_ID = Object.freeze(<const>{
	MAIN: 				"screen-main",
	CONTRIBUTE: 		"screen-contribute",
	CONTACT: 			"screen-contact-info",
	TERMS_CONDITIONS:	"screen-terms-and-conditions",
	PRIVACY_POLICY: 	"screen-privacy-policy",
});
let screenDescs = Object.freeze(Object.keys(SCREEN_ID)
	.map<ScreenDesc>((jsScreenId) => {
		const screenId = SCREEN_ID[jsScreenId];
		const desc = Object.freeze({
			id:			screenId,
			bodyElem: 	document.getElementById(screenId)!,
			buttonElem: document.getElementById("goto-" + screenId)!,
		});
		// Perform some sneaky initialization inside `Array.map`.
		desc.bodyElem.style.display = "none";
		desc.buttonElem.tabIndex = 0;
		desc.buttonElem.addEventListener("pointerenter", (ev) => {
			desc.buttonElem.focus();
		});
		desc.buttonElem.addEventListener("pointerleave", (ev) => {
			desc.buttonElem.blur();
		});
		desc.buttonElem.onclick = (ev) => {
			SWITCH_SCREEN(desc.id);
		};
		return desc;
	}).reduce<{[SID in SCREEN_ID]: ScreenDesc}>((build, screenDesc) => {
		build[screenDesc.id] = screenDesc;
		return build;
	}, {} as any)
);
type SCREEN_ID = typeof SCREEN_ID[keyof typeof SCREEN_ID];
type ScreenDesc = Readonly<{
	id: 		SCREEN_ID;
	bodyElem: 	HTMLElement;
	buttonElem: HTMLElement;
}>;
function SWITCH_SCREEN(targetId: SCREEN_ID): void {
	const oldCur = __CURRENT_SCREEN;
	const target = screenDescs[targetId];
	if (target !== oldCur) {
		target.bodyElem.style.display = ""; // Hand back control to CSS.
		//if (targetId !== SCREEN_ID.MAIN) {
			target.buttonElem.dataset["screenCurrent"] = ""; // exists.
		//}
		target.bodyElem.focus();
		if (oldCur) {
			// ^Check for edge-case (__CURRENT_SCREEN start off as undefined).
			oldCur.bodyElem.style.display = "none";
			delete oldCur.buttonElem.dataset["screenCurrent"]; // delete.
		}
		__CURRENT_SCREEN = target;
	}
}
// Go to the default (main) screen:
SWITCH_SCREEN(SCREEN_ID.MAIN);


const SUBMISSION_MODAL = document.getElementById("submission-modal")!;
SUBMISSION_MODAL.addEventListener("keydown", (ev) => {
    if (ev.key === "Escape") {
        SUBMISSION_MODAL.style.visibility = "hidden";
    }
});
SUBMISSION_MODAL.addEventListener("click", (ev) => {
    if (ev.target === SUBMISSION_MODAL) {
        SUBMISSION_MODAL.style.visibility = "hidden";
    }
});


/**
 *
 */
// TODO.learn is memory a concern with the template? We could just request
// it over XHR every time we want to make a copy... Is the browser caching
// it already/anyway?
class MainScroll {
    public  readonly artHostElem: HTMLElement;
    private readonly svgTemplate: Promise<SVGSVGElement>;
    private readonly slots: MainScroll.Slot[];

    public constructor() {
        this.artHostElem = document.getElementById("main-scroll")!;
        this.svgTemplate = makeRequest(MainScroll.ARTWORK_SVG_URL).then((xhr) => {
            return xhr.responseXML!.documentElement!;
        }) as Promise<SVGSVGElement>;
        this.svgTemplate.then((xml) => {
            xml.setAttribute("text-anchor", "middle");
            xml.setAttribute("dominant-baseline", "middle");
        });
        this.slots = [];
        this.extendArtwork().then(() => {
			// TODO.impl fill in with existing submissions.
			mainScroll.fillSlot(0,"thepassionofchrist.png");
		});
    }

    /**
     *
     * NOTE: We intentionally don't try to attach any submission
     * thumbnails before attaching the new extension to the DOM (which
     * would reduce repaints, etc.) because we want to the artwork to
     * load first, and to do so quickly.
     */
    public async extendArtwork(): Promise<void> {
        const newSvgCopy = (await this.svgTemplate).cloneNode(true) as SVGSVGElement;

        const boxesLayer = newSvgCopy.getElementById("submission_boxes") as SVGGElement;
        const __allSlots = Array.from(boxesLayer.children) as SVGRectElement[];
        // ^A nascent version of allSlots defined to allow getting `length / 2`.
        const prevNumSlots = this.slots.length;
        const newSlots = __allSlots.splice(__allSlots.length / 2)
            // TODO.build ^Remove splice temp-fix if we solve the
            // duplicating issue from Adobe Illustrator's export.
            // (The second half are unwanted duplicates of the first half).

            // Sort by Y-position, breaking ties by X-position.
            .map((rect) => Object.freeze({ rect, x: rect.x.baseVal.value, y: rect.y.baseVal.value, }))
            .sort((a,b) => a.x - b.x).sort((a,b) => a.y - b.y)
            .map((desc, index) => new MainScroll.Slot(prevNumSlots + index, desc.rect));
        this.slots.push(...newSlots);

        this.artHostElem.appendChild(newSvgCopy);
    }

    /**
     * Throws an error if the slot is not empty.
     */
    // TODO.impl this should only need to take the slot id.
    public fillSlot(slotId: MainScroll.Slot.Id, imageFilename: string): void {
        // TODO.impl
        const slot = this.slots[slotId];
        if (!slot.isEmpty) throw new Error(`slot \`${slotId}\` is already occupied`);
        slot.__fill(imageFilename);
    }
}
namespace MainScroll {
    // Set to fetch from GitHub repo because browsers don't like
    // XHR without HTTPS (because it may not be safe from attackers).
    export const ARTWORK_SVG_URL = GITHUB_RAW + "assets/images/houses.svg";
    /**
     *
     */
    export class Slot {
        private readonly shapeRect: SVGRectElement;
        private readonly baseElem:  SVGSVGElement;
        private __image: SVGImageElement | undefined;

        public constructor(id: Slot.Id, rect: SVGRectElement) {
            this.shapeRect = rect;
            const base = this.baseElem = document.createElementNS(SVG_NSPS, "svg");
            base.classList.add("submission", "text-select-disabled");
            const bsa = base.setAttribute.bind(base);
            bsa(     "x", rect.x.baseVal.valueAsString);
            bsa(     "y", rect.y.baseVal.valueAsString);
            bsa("height", rect.height.baseVal.valueAsString);
            bsa( "width", rect.width.baseVal.valueAsString);
            bsa("preserveAspectRatio", "xMidYMid slice");
            bsa("viewBox", "-50 -50 100 100");
            // Create id text:
            const idText = document.createElementNS(SVG_NSPS, "text");
            idText.classList.add("submission__id-text");
            idText.innerHTML = id.toString();
            base.appendChild(idText);

            // Attach base element to svg/xml document.
            rect.insertAdjacentElement("afterend", base);
        }
        /**
         * Do not use this directly. Use the wrapper defined in `MainScroll`.
         */
        // TODO.design This should take a slot id.
        public __fill(imageFilename: string): void {
            const img = this.__image = document.createElementNS(SVG_NSPS, "image");
            img.classList.add("submission__image");
            img.tabIndex = 0; // Allow selection via tabbing and click.
            img.onclick = (ev) => {
                if (this.isEmpty) {
                    // TODO.design Handle submission request:
                } else {
                    this.displayFull();
                }
            };

            const href = Slot.ASSETS_ROOT + imageFilename;
            img.setAttributeNS(XLINK_NSPS, "href", href);

            const isa = img.setAttribute.bind(img);
            isa(     "x", "-50");
            isa(     "y", "-50");
            isa("height", "100");
            isa( "width", "100");
            isa("preserveAspectRatio", "xMidYMid slice");
            this.baseElem.appendChild(img);
            // It should go after since SVG1 uses xml-tree order to determine
            // paint-order, and we want it to go _on top_ of the slot rectangle.
        }
        public get isEmpty(): boolean {
            return this.__image === undefined;
        }

        public displayFull(): void {
            SUBMISSION_MODAL.style.visibility = "visible";
            // TODO.impl Put this submission's contents in the modal.
        }
    }
    export namespace Slot {
        export type Id = number;
        export const ASSETS_ROOT = "assets/images/submissions/";
    }
    Object.freeze(Slot);
    Object.freeze(Slot.prototype);
}
Object.freeze(MainScroll);
Object.freeze(MainScroll.prototype);


/**
 * Instantiate it:
 */
const mainScroll = new MainScroll();
