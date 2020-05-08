"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var SVG_NSPS = "http://www.w3.org/2000/svg";
var XLINK_NSPS = "http://www.w3.org/1999/xlink";
var GITHUB_RAW = (window.origin != "null") ? ""
    : "https://raw.githubusercontent.com/david-fong/CovidWithGratitude/dev/";
function makeRequest(url, method) {
    if (method === void 0) { method = "GET"; }
    return __awaiter(this, void 0, void 0, function () {
        var request;
        return __generator(this, function (_a) {
            request = new XMLHttpRequest();
            return [2, new Promise(function (resolve, reject) {
                    request.onreadystatechange = function () {
                        if (request.readyState !== 4)
                            return;
                        if (request.status >= 200 && request.status < 300) {
                            resolve(request);
                        }
                        else {
                            reject(request);
                        }
                    };
                    request.open(method, url);
                    request.send();
                })];
        });
    });
}
;
var VIEW_SUBMISSION_SCREEN = document.getElementById("screen-view-submission");
VIEW_SUBMISSION_SCREEN.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") {
        VIEW_SUBMISSION_SCREEN.style.visibility = "hidden";
    }
});
VIEW_SUBMISSION_SCREEN.addEventListener("click", function (ev) {
    if (ev.target === VIEW_SUBMISSION_SCREEN) {
        VIEW_SUBMISSION_SCREEN.style.visibility = "hidden";
    }
});
var Submission = (function () {
    function Submission(svgImage) {
        this.svgImage = svgImage;
    }
    return Submission;
}());
Object.freeze(Submission);
Object.freeze(Submission.prototype);
var MainScroll = (function () {
    function MainScroll() {
        var _this = this;
        this.xmlHost = document.querySelector(".main-scroll__content");
        this.svg = makeRequest(MainScroll.SVG_URL).then(function (xhr) {
            return xhr.responseXML.documentElement;
        });
        this.svg.then(function (xml) { return _this.xmlHost.appendChild(xml); });
        this.slots = this.svg.then(function (xml) {
            var boxesLayer = xml.getElementById("submission_boxes");
            var __allSlots = Array.from(boxesLayer.children);
            var allSlots = Object.freeze(__allSlots.splice(__allSlots.length / 2));
            return Object.freeze({
                all: allSlots,
                free: allSlots.slice(),
                taken: [],
            });
        });
        this.submissions = [];
    }
    MainScroll.prototype.registerSubmission = function (imageFilename) {
        return __awaiter(this, void 0, void 0, function () {
            var href, img, submission, box, x, y, h, w;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        href = "assets/images/submissions/" + imageFilename;
                        img = document.createElementNS(SVG_NSPS, "image");
                        img.classList.add("submission");
                        img.setAttributeNS(XLINK_NSPS, "href", href);
                        img.tabIndex = 0;
                        submission = new Submission(img);
                        img.onclick = function (ev) {
                            _this.displayFullSubmission(submission);
                        };
                        return [4, this.takeEmptyBox()];
                    case 1:
                        box = _a.sent();
                        img.setAttribute("preserveAspectRatio", "xMidYMid slice");
                        x = box.x.baseVal;
                        y = box.y.baseVal;
                        h = box.height.baseVal;
                        w = box.width.baseVal;
                        x.value;
                        img.setAttribute("x", x.valueAsString);
                        img.setAttribute("y", y.valueAsString);
                        img.setAttribute("height", h.valueAsString);
                        img.setAttribute("width", w.valueAsString);
                        img.style.transformOrigin = x.value + (w.value / 2) + " " + (y.value + (h.value / 2));
                        box.insertAdjacentElement("afterend", img);
                        this.submissions.push(submission);
                        return [2, img];
                }
            });
        });
    };
    MainScroll.prototype.takeEmptyBox = function () {
        return __awaiter(this, void 0, void 0, function () {
            var slots, retval;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4, this.slots];
                    case 1:
                        slots = _a.sent();
                        if (slots.free.length) {
                            retval = slots.free.shift();
                        }
                        else {
                            retval = undefined;
                        }
                        slots.taken.push(retval);
                        return [2, retval];
                }
            });
        });
    };
    MainScroll.prototype.displayFullSubmission = function (submission) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                VIEW_SUBMISSION_SCREEN.style.visibility = "visible";
                return [2];
            });
        });
    };
    return MainScroll;
}());
(function (MainScroll) {
    MainScroll.SVG_URL = GITHUB_RAW + "assets/images/houses.svg";
})(MainScroll || (MainScroll = {}));
Object.freeze(MainScroll);
Object.freeze(MainScroll.prototype);
var mainScroll = new MainScroll();
//# sourceMappingURL=index.js.map