const SVG_NSPS   = "http://www.w3.org/2000/svg";
const XLINK_NSPS = "http://www.w3.org/1999/xlink";
const IMAGE_REGEXP = /.((png)|(jpg)|(jpeg))$/i; // If changed, also update the json-generator script.

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
class GitHubFiles {
    public readonly urlAssetsGetRaw: string;
    public constructor(desc: { repoOwner: string; repoName: string; branch: string; }) {
        this.urlAssetsGetRaw = `https://raw.githubusercontent.com/`
            + `${desc.repoOwner}/${desc.repoName}/${desc.branch}/`
            + `assets/submissions/`;
    }
}
const GITHUB_FILES = new GitHubFiles(
    { repoOwner: "covidwg20", repoName: "covidwithgratitude", branch: "assets", },
);


Array.from(document.getElementById("social-media-links")!.getElementsByTagName("a"))
.forEach((socialLink) => {
	// Do this so we can use CSS' `focus-within` pseudo class specifier:
	socialLink.onpointerenter = () => socialLink.focus();
	socialLink.onpointerleave = () => socialLink.blur();
});
Array.from(document.getElementById("submission-view")!.getElementsByTagName("button"))
.forEach((btn) => {
	// Do this so we can use CSS' `focus-within` pseudo class specifier:
	btn.onpointerenter = () => btn.focus();
	btn.onpointerleave = () => btn.blur();
});


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
		// Perform some initialization inside `Array.map`.
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
        target.buttonElem.dataset["screenCurrent"] = ""; // exists.
        main?.hideModal();
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


/**
 *
 */
class Main {
    public  readonly artHostElem: HTMLElement;
    public  readonly svgTemplate: Promise<SVGSVGElement>;
    private readonly slots: Main.Slot[];
    private readonly contributeButton: HTMLElement;

    private readonly modal: Readonly<{
        turnOffScrollElem: HTMLElement;
        baseElem:       HTMLElement;
        imageElem:      HTMLImageElement;
        messageElem:    HTMLDivElement;
        navPrev:        HTMLButtonElement;
        navNext:        HTMLButtonElement;
        prefetchPrev:   HTMLLinkElement;
        prefetchNext:   HTMLLinkElement;
    }>;
    private modalCurrentSlot: Main.Slot;

    public constructor() {
        this.artHostElem = document.getElementById("main-content")!;
        this.svgTemplate = makeRequest(GITHUB_FILES.urlAssetsGetRaw + "artwork.svg").then((xhr) => {
            return xhr.responseXML!.documentElement!;
        }) as Promise<SVGSVGElement>;
        this.svgTemplate.then((xml) => {
            xml.setAttribute("text-anchor", "middle");
            xml.setAttribute("dominant-baseline", "middle");
        });
        this.slots = [];
        this.contributeButton = document.getElementById("goto-screen-contribute")!;

        makeRequest(GITHUB_FILES.urlAssetsGetRaw + "existing.json")
        .then((xhr) => Object.freeze(JSON.parse(xhr.response) as Record<Main.Slot.Id, Main.Slot.FilenameDesc>))
        .then(async (submissions) => {
            const ids = Object.keys(submissions).map((num) => Number(num))/* .sort((a,b) => a - b) */;
            for (const id of ids) {
                // Wait for each submission. It may take a while if it needs
                // to extend the artwork, and we don't want to accidentally
                // think we need to extend when we actually don't.
                await this.fillSlot(id, submissions[id]);
            }
        }).then(() => {
            if (this.slots.length === 0) {
                // There are no submissions yet. Show one empty copy of the artwork.
                this.extendArtwork();
            }
        });

        // Initialize modal:
        // NOTE: initialization is separated from assignment to hint
        // to VSCode to perform stronger type-checking.
        const modal: Main["modal"] = {
            turnOffScrollElem: document.getElementById("top-under-nav-wrapper")!,
            baseElem:    document.getElementById("submission-modal")!,
            imageElem:   document.getElementById("submission-view-image")   as HTMLImageElement,
            messageElem: document.getElementById("submission-view-message") as HTMLDivElement,
            navPrev:     document.getElementById("submission-view-prev")    as HTMLButtonElement,
            navNext:     document.getElementById("submission-view-next")    as HTMLButtonElement,
            prefetchPrev: document.createElement("link"),
            prefetchNext: document.createElement("link"),
        };
        this.modal = Object.assign(Object.create(null), modal);
        this.modal.prefetchPrev.rel = "prefetch";
        this.modal.prefetchNext.rel = "prefetch";
        document.head.appendChild(this.modal.prefetchPrev);
        document.head.appendChild(this.modal.prefetchNext);
        this.__addModalListeners();
        this.hideModal(); // <-- Disable tabbing to its nav buttons.
    }

    /**
     * Adds another copy of the repeating artwork. Does not load up
     * submission thumbnails.
     *
     * NOTE: We intentionally don't try to attach any submission
     * thumbnails before attaching the new extension to the DOM (which
     * would reduce repaints, etc.) because we want to the artwork to
     * load first, and to do so quickly.
     */
    public async extendArtwork(): Promise<void> {
        const newSvgCopy = (await this.svgTemplate).cloneNode(true) as SVGSVGElement;
        if (this.slots.length) {
            // If this is not the first copy, hide the submission-viewing instructions:
            const instructions = (
                newSvgCopy.getElementById("view_submission_instructions")
                || Array.from(newSvgCopy.children).find((child) => child.id === "view_submission_instructions")
            ) as SVGGElement;
            instructions.style.display = "none";
            Array.from(newSvgCopy.children).forEach((child) => {
                if (child.id.startsWith("oikos")) {
                    (child as SVGElement).style.display = "none";
                }
            });
        } else {
            /* const os = newSvgCopy.getElementById("oikos_squirrel") as SVGGElement;
            os.style.pointerEvents = "initial";
            os.onpointerenter = () => {
                const osBox = os.getBBox();
                const x = osBox.x + osBox.width/2;
                const y = osBox.y + osBox.height/2;
                const rotate = (degrees: number): string => {
                    return `rotate(${degrees} ${x.toString()} ${y.toString()})`;
                };
                os.animate({
                    transform: [
                        rotate(0),
                        rotate(120),
                        rotate(240),
                        rotate(0),
                    ],
                }, {
                    iterations: 40,
                    duration: 1200,
                });
            } */
        }

        const boxesLayer = (
            newSvgCopy.getElementById("submission_boxes")
            || Array.from(newSvgCopy.children).find((child) => child.id === "submission_boxes")
            // ^Safari isn't able to use `getElementById` for some reason...
        ) as SVGGElement;
        const __allSlots = Array.from(boxesLayer.children) as SVGRectElement[];
        // ^A nascent version of allSlots defined to allow getting `length / 2`.
        const prevNumSlots = this.slots.length;
		const displayModal = (slotSelf: Main.Slot) => {
            this.setModalSubmission(slotSelf);
            this.showModal();
        };
		{const newSlots = __allSlots.splice(__allSlots.length / 2)
            // TODO.build ^Remove splice temp-fix if we solve the
            // duplicating issue from Adobe Illustrator's export.
            // (The second half are unwanted duplicates of the first half).

			// Sort by Y-position, breaking ties by X-position.
            .map((rect) => Object.freeze({ rect, x: rect.x.baseVal.value, y: rect.y.baseVal.value, }))
            .sort((a,b) => a.x - b.x).sort((a,b) => a.y - b.y)
            .map((desc, index) => {
                // Sneaky initialization:
                /* desc.rect.onpointerenter = (ev) => {
                    this.contributeButton.animate({
                        transform: ["scale(1)", "scale(1.2)", "scale(1.2)",],
                        easing: "ease-in-out",
                    }, {
                        direction: "alternate",
                        duration: 900,
                    });
                }; */
                return new Main.Slot(
                    prevNumSlots + index,
                    displayModal,
                    desc.rect,
                );
            });
        this.slots.push(...newSlots);}
        this.artHostElem.appendChild(newSvgCopy);
    }

    /**
     * Throws an error if the slot is not empty.
     */
    public async fillSlot(slotId: Main.Slot.Id, desc: Main.Slot.FilenameDesc): Promise<void> {
        if (slotId < this.slots.length) {
            const slot = this.slots[slotId];
            if (!slot.isEmpty) throw new Error(`slot \`${slotId}\` is already occupied`);
            slot.__fill(desc);
        } else {
            await this.extendArtwork();
            // Recurse, extending the artwork once each time until
            // the slot to be filled exists:
            await this.fillSlot(slotId, desc);
        }
    }

    /**
     * Returns undefined if there are no further preceding slots.
     */
    public get modalPrevSlot(): Main.Slot | undefined {
        if (this.modalCurrentSlot === undefined) return;
        for (let i = this.modalCurrentSlot.id - 1; i >= 0; i--) {
            const slot = this.slots[i];
            if (!slot.isEmpty) {
                return slot;
            }
        }
        return undefined
    }
    /**
     * Returns undefined if there are no further slots ahead.
     */
    public get modalNextSlot(): Main.Slot | undefined {
        if (this.modalCurrentSlot === undefined) return;
        const numSlots = this.slots.length;
        for (let i = this.modalCurrentSlot.id + 1; i < numSlots; i++) {
            const slot = this.slots[i];
            if (!slot.isEmpty) {
                return slot;
            }
        }
        return undefined;
    }
    /**
     * Does nothing is the slot argument is undefined.
     */
    public setModalSubmission(slot: Main.Slot | undefined): void {
        if (slot === undefined) {
            return;
        }
        this.modalCurrentSlot = slot;
        // Update image:
        if (slot.imageSource) {
            this.modal.imageElem.src = slot.imageSource;
            this.modal.imageElem.style.display = "";
        } else {
            this.modal.imageElem.style.display = "none";
        }
        // Update message text:
        this.modal.messageElem.textContent = slot.messageString;

        // Prefetch adjacent submission images:
        this.modal.prefetchPrev.href = this.modalPrevSlot?.imageSource ?? "";
        this.modal.prefetchNext.href = this.modalNextSlot?.imageSource ?? "";
    }
    public showModal(): void {
        this.modal.baseElem.tabIndex = 0; // Allow clicking background to exit modal.
        this.modal.navPrev.disabled = false;
        this.modal.navNext.disabled = false;
        this.modal.turnOffScrollElem.style.overflowY = "hidden";
        this.artHostElem.dataset["showModal"] = "";
        this.modal.baseElem.dataset["showModal"] = "";
        this.modal.baseElem.focus();
    }
    public hideModal(): void {
        this.modal.baseElem.tabIndex = -1;
        this.modal.navPrev.disabled = true;
        this.modal.navNext.disabled = true;
        this.modal.turnOffScrollElem.style.overflow = "";
        delete this.artHostElem.dataset["showModal"];
        delete this.modal.baseElem.dataset["showModal"];
    }

    private __addModalListeners(): void {
        const modalNavPrev = () => { this.setModalSubmission(this.modalPrevSlot); };
        const modalNavNext = () => { this.setModalSubmission(this.modalNextSlot); };
        this.modal.baseElem.addEventListener("keydown", (ev) => {
            if (ev.key === "Escape") {
                this.hideModal();
            } else if (ev.key === "ArrowLeft") {
                modalNavPrev();
            } else if (ev.key === "ArrowRight") {
                modalNavNext();
            }
        });
        this.modal.baseElem.addEventListener("click", (ev) => {
            if (ev.target === this.modal.baseElem) {
                this.hideModal();
            }
        });
        this.modal.navPrev.onclick = modalNavPrev;
        this.modal.navNext.onclick = modalNavNext;
    }
}
namespace Main {
    /**
     *
     */
    export class Slot {
        public  readonly id: Slot.Id;
        private readonly baseElem: SVGSVGElement;
        private __imageFilename: undefined | string;
        private __messageString: undefined | string;
        private readonly displayModal: (self: Slot) => void;

        public constructor(
			id: Slot.Id,
			displayModal: (self: Slot) => void,
			rect: SVGRectElement,
		) {
            this.id = id;
			this.displayModal = displayModal;
            const base = this.baseElem = document.createElementNS(SVG_NSPS, "svg");
            base.classList.add("submission", "text-select-disabled");

            const x = rect.x.baseVal, y = rect.y.baseVal, h = rect.height.baseVal, w = rect.width.baseVal;
            const bsa = base.setAttribute.bind(base);
            bsa(     "x", x.valueAsString);
            bsa(     "y", y.valueAsString);
            bsa("height", h.valueAsString);
            bsa( "width", w.valueAsString);
            bsa("preserveAspectRatio", "xMidYMid slice");

            bsa("viewBox", `${-w.value/2} ${-h.value/2} ${w.value} ${h.value}`);
            // Create id text:
            const idText = document.createElementNS(SVG_NSPS, "text");
            idText.classList.add("submission__id-text");
            idText.textContent = id.toString();
            base.appendChild(idText);

            // Attach base element to svg/xml document.
            // It should go after since SVG1 uses xml-tree order to determine
            // paint-order, and we want it to go _on top_ of the slot rectangle.
            rect.insertAdjacentElement("afterend", base);
        }
        /**
         * Do not use this directly. Use the wrapper defined in `MainScroll`.
         */
        public __fill(desc: Slot.FilenameDesc): void {
            this.__imageFilename = desc.img;
            makeRequest(GITHUB_FILES.urlAssetsGetRaw + this.id + "/message.txt")
            .then((xhr) => {
                this.__messageString = xhr.responseText;
            });
            if (desc.img) {
                const img = document.createElementNS(SVG_NSPS, "image");
                img.classList.add("submission__image");
                img.setAttribute("loading", "lazy");
                img.tabIndex = 0; // Allow selection via tabbing and click.
                img.onclick = (ev) => {
                    this.displayModal(this);
                };
                const imageSrc = GITHUB_FILES.urlAssetsGetRaw + this.id + "/thumb.jpg";
                img.setAttributeNS(XLINK_NSPS, "href", imageSrc);
                const box = this.baseElem.viewBox.baseVal;
                const isa = img.setAttribute.bind(img);
                isa(     "x", box.x.toString());
                isa(     "y", box.y.toString());
                isa("height", box.height.toString());
                isa( "width", box.width.toString());
                isa("preserveAspectRatio", "xMidYMid slice");
                this.baseElem.appendChild(img);
            }
        }
        public get isEmpty(): boolean {
            return this.messageString === "";
        }
        public get imageSource(): string {
            return this.__imageFilename
            ? GITHUB_FILES.urlAssetsGetRaw + `${this.id}/${this.__imageFilename}`
            : "";
        }
        public get messageString(): string {
            return this.__messageString ?? "";
        }
    }
    export namespace Slot {
        export type Id = number;
        export type FilenameDesc = Readonly<{
            img: string;
        }>;
    }
    Object.freeze(Slot);
	Object.freeze(Slot.prototype);
}
Object.freeze(Main);
Object.freeze(Main.prototype);


/**
 * Instantiate it:
 */
const main = new Main();
window.setTimeout(() => {
    document.body.classList.remove("top-no-transitions-pre-load");
}, 200);
