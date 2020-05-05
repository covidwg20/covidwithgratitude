const SVG_NSPS = "http://www.w3.org/2000/svg";
const XLINK_NSPS = "http://www.w3.org/1999/xlink";

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
    public readonly hostElem: HTMLElement;
	private readonly xmlDoc: Promise<HTMLElement>;
	private readonly submissionRects: Promise<ReadonlyArray<SVGRectElement>>;

    public constructor() {
		this.hostElem = document.querySelector(".main-scroll__houses") as HTMLElement;
		this.xmlDoc = makeRequest(MainScroll.SVG_URL)
			.then((xhr) => xhr.responseXML!.documentElement!);
		this.xmlDoc.then((xml) => this.hostElem.appendChild(xml));

		this.submissionRects = this.xmlDoc.then((xml) => {
			return Array.from<SVGRectElement>(
				xml.getElementsByClassName("submission-viewbox") as
				HTMLCollectionOf<SVGRectElement>
			);
		});
		this.submissionRects.then((rects) => {
			rects.forEach((rect) => {
				if (!(rect instanceof SVGRectElement)) {
					console.log(rect);
				}
				console.log(rect.tabIndex);
				rect.style.color = "black";
			});
		});
	}

	public async registerSubmission(href: string): Promise<void> {
		const img = document.createElementNS(SVG_NSPS, "image");
		img.setAttributeNS(XLINK_NSPS, "href", href);
		await this.submissionRects;

		const box = await this.getEmptyBox();
		img.setAttribute("preserveAspectRatio", "xMidYMid slice");
		img.setAttribute("x", box.x.baseVal.toString());
		img.setAttribute("y", box.y.baseVal.toString());
		img.setAttribute("height", box.height.baseVal.toString());
		img.setAttribute("width",  box.width.baseVal.toString());
		box.insertAdjacentElement("afterend", img);
	}

	// TODO.impl also, this should add another copy of the artwork if all
	// existing submission boxes are full.
	public async getEmptyBox(): Promise<SVGRectElement> {
		return undefined!;
	}
}
namespace MainScroll {
	export const SVG_URL = "assets/images/house.svg";
}

/**
 * Instantiate it:
 */
const mainScroll = new MainScroll();

