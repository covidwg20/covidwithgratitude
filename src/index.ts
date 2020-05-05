const SVG_NSPS = "http://www.w3.org/2000/svg";
const XLINK_NSPS = "http://www.w3.org/1999/xlink";

// TODO if repo moves to organization, update link. Once we enter
// production, it may be better to use the `gh-pages` branch here...
const GITHUB_RAW = "https://raw.githubusercontent.com/david-fong/CovidWithGratitude/dev/";

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


/**
 *
 */
class MainScroll {
    public  readonly xmlHost: HTMLElement;
	private readonly svg: Promise<SVGSVGElement>;
	private readonly slots: Promise<Readonly<{
		all:   readonly SVGRectElement[];
		free: SVGRectElement[];
		taken: SVGRectElement[];
	}>>;

    public constructor() {
		this.xmlHost = document.querySelector(".main-scroll__content") as HTMLElement;
		this.svg = makeRequest(MainScroll.SVG_URL).then((xhr) => {
			return xhr.responseXML!.documentElement!;
		}) as Promise<SVGSVGElement>;
		this.svg.then((xml) => this.xmlHost.appendChild(xml));

		this.slots = this.svg.then((xml) => {
			const boxesLayer = xml.getElementById("submission_boxes") as SVGGElement;
			const __allSlots = Array.from(boxesLayer.children) as SVGRectElement[];
			const allSlots = Object.freeze(
				__allSlots.splice(__allSlots.length / 2)
				// TODO.build ^Remove splice temp-fix if we solve the
				// duplicating issue from Adobe Illustrator's export.
				// (The second half are unwanted duplicates of the first half).
			);
			return Object.freeze({
				all:   allSlots,
				free:  allSlots.slice(),
				taken: [],
			});
		});
	}

	/**
	 *
	 * @param imageFilename - Must include the file extension.
	 */
	public async registerSubmission(imageFilename: string): Promise<SVGImageElement> {
		const href = "assets/images/submissions/" + imageFilename;
		const img = document.createElementNS(SVG_NSPS, "image");
		img.classList.add("submission");
		img.setAttributeNS(XLINK_NSPS, "href", href);
		img.tabIndex = 0; // Allow selection via tabbing and click.
		img.onclick = (ev) => console.log("click!");

		const box = await this.takeEmptyBox();
		img.setAttribute("preserveAspectRatio", "xMidYMid slice");
		img.setAttribute(	  "x", box.x.baseVal.valueAsString);
		img.setAttribute(     "y", box.y.baseVal.valueAsString);
		img.setAttribute("height", box.height.baseVal.valueAsString);
		img.setAttribute( "width", box.width.baseVal.valueAsString);
		box.insertAdjacentElement("afterend", img);
		// It should go after since SVG1 uses xml-tree order to determine
		// paint-order, and we want it to go _on top_ of the slot rectangle.
		return img;
	}

	/**
	 *
	 */
	public async takeEmptyBox(): Promise<SVGRectElement> {
		const slots = await this.slots;
		let retval: SVGRectElement;
		if (slots.free.length) {
			retval = slots.free.shift()!;
		} else {
			// There are no slots remaining. Extend the artwork:
			// TODO extend the artwork.
			retval = undefined!;
		}
		slots.taken.push(retval);
		// TODO.impl if outside main-scroll__sizer, increase sizer.
		return retval;
	}
}
namespace MainScroll {
	// Set to fetch from GitHub repo because browsers don't like
	// XHR without HTTPS (because it may not be safe from attackers).
	export const SVG_URL = GITHUB_RAW + "assets/images/houses.svg";
}
Object.freeze(MainScroll);
Object.freeze(MainScroll.prototype);

/**
 * Instantiate it:
 */
const mainScroll = new MainScroll();

