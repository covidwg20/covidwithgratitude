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
var __CURRENT_SCREEN = undefined;
var SCREEN_ID = Object.freeze({
    MAIN: "screen-main",
    CONTRIBUTE: "screen-contribute",
    CONTACT: "screen-contact-info",
    TERMS_CONDITIONS: "screen-terms-and-conditions",
    PRIVACY_POLICY: "screen-privacy-policy",
});
var screenDescs = Object.freeze(Object.keys(SCREEN_ID)
    .map(function (jsScreenId) {
    var screenId = SCREEN_ID[jsScreenId];
    var desc = Object.freeze({
        id: screenId,
        bodyElem: document.getElementById(screenId),
        buttonElem: document.getElementById("goto-" + screenId),
    });
    desc.bodyElem.style.display = "none";
    desc.buttonElem.tabIndex = 0;
    desc.buttonElem.addEventListener("pointerenter", function (ev) {
        desc.buttonElem.focus();
    });
    desc.buttonElem.addEventListener("pointerleave", function (ev) {
        desc.buttonElem.blur();
    });
    desc.buttonElem.onclick = function (ev) {
        SWITCH_SCREEN(desc.id);
    };
    return desc;
}).reduce(function (build, screenDesc) {
    build[screenDesc.id] = screenDesc;
    return build;
}, {}));
function SWITCH_SCREEN(targetId) {
    var oldCur = __CURRENT_SCREEN;
    var target = screenDescs[targetId];
    if (target !== oldCur) {
        target.bodyElem.style.display = "";
        target.buttonElem.dataset["screenCurrent"] = "";
        target.bodyElem.focus();
        if (oldCur) {
            oldCur.bodyElem.style.display = "none";
            delete oldCur.buttonElem.dataset["screenCurrent"];
        }
        __CURRENT_SCREEN = target;
    }
}
SWITCH_SCREEN(SCREEN_ID.MAIN);
var SUBMISSION_MODAL = document.getElementById("submission-modal");
SUBMISSION_MODAL.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") {
        SUBMISSION_MODAL.style.visibility = "hidden";
    }
});
SUBMISSION_MODAL.addEventListener("click", function (ev) {
    if (ev.target === SUBMISSION_MODAL) {
        SUBMISSION_MODAL.style.visibility = "hidden";
    }
});
var MainScroll = (function () {
    function MainScroll() {
        this.artHostElem = document.getElementById("main-scroll");
        this.svgTemplate = makeRequest(MainScroll.ARTWORK_SVG_URL).then(function (xhr) {
            return xhr.responseXML.documentElement;
        });
        this.svgTemplate.then(function (xml) {
            xml.setAttribute("text-anchor", "middle");
            xml.setAttribute("dominant-baseline", "middle");
        });
        this.slots = [];
        this.extendArtwork().then(function () {
            mainScroll.fillSlot(0, "thepassionofchrist.png");
        });
    }
    MainScroll.prototype.extendArtwork = function () {
        return __awaiter(this, void 0, void 0, function () {
            var newSvgCopy, boxesLayer, __allSlots, prevNumSlots, newSlots;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4, this.svgTemplate];
                    case 1:
                        newSvgCopy = (_b.sent()).cloneNode(true);
                        boxesLayer = newSvgCopy.getElementById("submission_boxes");
                        __allSlots = Array.from(boxesLayer.children);
                        prevNumSlots = this.slots.length;
                        newSlots = __allSlots.splice(__allSlots.length / 2)
                            .map(function (rect) { return Object.freeze({ rect: rect, x: rect.x.baseVal.value, y: rect.y.baseVal.value, }); })
                            .sort(function (a, b) { return a.x - b.x; }).sort(function (a, b) { return a.y - b.y; })
                            .map(function (desc, index) { return new MainScroll.Slot(prevNumSlots + index, desc.rect); });
                        (_a = this.slots).push.apply(_a, newSlots);
                        this.artHostElem.appendChild(newSvgCopy);
                        return [2];
                }
            });
        });
    };
    MainScroll.prototype.fillSlot = function (slotId, imageFilename) {
        var slot = this.slots[slotId];
        if (!slot.isEmpty)
            throw new Error("slot `" + slotId + "` is already occupied");
        slot.__fill(imageFilename);
    };
    return MainScroll;
}());
(function (MainScroll) {
    MainScroll.ARTWORK_SVG_URL = GITHUB_RAW + "assets/images/houses.svg";
    var Slot = (function () {
        function Slot(id, rect) {
            this.shapeRect = rect;
            var base = this.baseElem = document.createElementNS(SVG_NSPS, "svg");
            base.classList.add("submission", "text-select-disabled");
            var bsa = base.setAttribute.bind(base);
            bsa("x", rect.x.baseVal.valueAsString);
            bsa("y", rect.y.baseVal.valueAsString);
            bsa("height", rect.height.baseVal.valueAsString);
            bsa("width", rect.width.baseVal.valueAsString);
            bsa("preserveAspectRatio", "xMidYMid slice");
            bsa("viewBox", "-50 -50 100 100");
            var idText = document.createElementNS(SVG_NSPS, "text");
            idText.classList.add("submission__id-text");
            idText.innerHTML = id.toString();
            base.appendChild(idText);
            rect.insertAdjacentElement("afterend", base);
        }
        Slot.prototype.__fill = function (imageFilename) {
            var _this = this;
            var img = this.__image = document.createElementNS(SVG_NSPS, "image");
            img.classList.add("submission__image");
            img.tabIndex = 0;
            img.onclick = function (ev) {
                if (_this.isEmpty) {
                }
                else {
                    _this.displayFull();
                }
            };
            var href = Slot.ASSETS_ROOT + imageFilename;
            img.setAttributeNS(XLINK_NSPS, "href", href);
            var isa = img.setAttribute.bind(img);
            isa("x", "-50");
            isa("y", "-50");
            isa("height", "100");
            isa("width", "100");
            isa("preserveAspectRatio", "xMidYMid slice");
            this.baseElem.appendChild(img);
        };
        Object.defineProperty(Slot.prototype, "isEmpty", {
            get: function () {
                return this.__image === undefined;
            },
            enumerable: true,
            configurable: true
        });
        Slot.prototype.displayFull = function () {
            SUBMISSION_MODAL.style.visibility = "visible";
        };
        return Slot;
    }());
    MainScroll.Slot = Slot;
    (function (Slot) {
        Slot.ASSETS_ROOT = "assets/images/submissions/";
    })(Slot = MainScroll.Slot || (MainScroll.Slot = {}));
    Object.freeze(Slot);
    Object.freeze(Slot.prototype);
})(MainScroll || (MainScroll = {}));
Object.freeze(MainScroll);
Object.freeze(MainScroll.prototype);
var mainScroll = new MainScroll();
//# sourceMappingURL=index.js.map