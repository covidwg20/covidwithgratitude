declare const SVG_NSPS = "http://www.w3.org/2000/svg";
declare const XLINK_NSPS = "http://www.w3.org/1999/xlink";
declare const GITHUB_RAW = "https://raw.githubusercontent.com/david-fong/CovidWithGratitude/dev/";
declare function makeRequest(url: string, method?: string): Promise<XMLHttpRequest>;
declare class MainScroll {
    readonly hostElem: HTMLElement;
    private readonly xmlDoc;
    private readonly submissionRects;
    constructor();
    registerSubmission(href: string): Promise<void>;
    getEmptyBox(): Promise<SVGRectElement>;
}
declare namespace MainScroll {
    const SVG_URL: string;
}
declare const mainScroll: MainScroll;
