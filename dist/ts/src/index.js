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
var IMAGE_REGEXP = /.((png)|(jpg)|(jpeg))$/i;
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
var GitHubFiles = (function () {
    function GitHubFiles(desc) {
        this.urlAssetsGetRaw = "https://raw.githubusercontent.com/"
            + (desc.repoOwner + "/" + desc.repoName + "/" + desc.branch + "/")
            + "assets/submissions/";
    }
    return GitHubFiles;
}());
var GITHUB_FILES = new GitHubFiles({ repoOwner: "covidwg20", repoName: "CovidWithGratitude", branch: "assets", });
Array.from(document.getElementById("social-media-links").getElementsByTagName("a"))
    .forEach(function (socialLink) {
    socialLink.onpointerenter = function () { return socialLink.focus(); };
    socialLink.onpointerleave = function () { return socialLink.blur(); };
});
Array.from(document.getElementById("submission-view").getElementsByTagName("button"))
    .forEach(function (btn) {
    btn.onpointerenter = function () { return btn.focus(); };
    btn.onpointerleave = function () { return btn.blur(); };
});
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
        main === null || main === void 0 ? void 0 : main.hideModal();
        if (oldCur) {
            oldCur.bodyElem.style.display = "none";
            delete oldCur.buttonElem.dataset["screenCurrent"];
        }
        __CURRENT_SCREEN = target;
    }
}
SWITCH_SCREEN(SCREEN_ID.MAIN);
var Main = (function () {
    function Main() {
        var _this = this;
        this.artHostElem = document.getElementById("main-content");
        this.svgTemplate = makeRequest(GITHUB_FILES.urlAssetsGetRaw + "artwork.svg").then(function (xhr) {
            return xhr.responseXML.documentElement;
        });
        this.svgTemplate.then(function (xml) {
            xml.setAttribute("text-anchor", "middle");
            xml.setAttribute("dominant-baseline", "middle");
        });
        this.slots = [];
        makeRequest(GITHUB_FILES.urlAssetsGetRaw + "existing.json")
            .then(function (xhr) { return JSON.parse(xhr.response); })
            .then(function (submissions) { return __awaiter(_this, void 0, void 0, function () {
            var ids, _i, ids_1, id;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ids = Object.keys(submissions).map(function (num) { return Number(num); }).sort(function (a, b) { return a - b; });
                        _i = 0, ids_1 = ids;
                        _a.label = 1;
                    case 1:
                        if (!(_i < ids_1.length)) return [3, 4];
                        id = ids_1[_i];
                        return [4, this.fillSlot(id, submissions[id])];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3, 1];
                    case 4: return [2];
                }
            });
        }); });
        var modal = {
            turnOffScrollElem: document.getElementById("top-under-nav-wrapper"),
            baseElem: document.getElementById("submission-modal"),
            imageElem: document.getElementById("submission-view-image"),
            messageElem: document.getElementById("submission-view-message"),
            navPrev: document.getElementById("submission-view-prev"),
            navNext: document.getElementById("submission-view-next"),
        };
        this.modal = Object.assign(Object.create(null), modal);
        this.__addModalListeners();
        this.hideModal();
    }
    Main.prototype.extendArtwork = function () {
        return __awaiter(this, void 0, void 0, function () {
            var newSvgCopy, boxesLayer, __allSlots, prevNumSlots, displayModal, newSlots;
            var _a;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4, this.svgTemplate];
                    case 1:
                        newSvgCopy = (_b.sent()).cloneNode(true);
                        boxesLayer = (newSvgCopy.getElementById("submission_boxes")
                            || Array.from(newSvgCopy.children).find(function (child) { return child.id === "submission_boxes"; }));
                        __allSlots = Array.from(boxesLayer.children);
                        prevNumSlots = this.slots.length;
                        displayModal = function (slotSelf) {
                            _this.setModalSubmission(slotSelf);
                            _this.showModal();
                        };
                        newSlots = __allSlots.splice(__allSlots.length / 2)
                            .map(function (rect) { return Object.freeze({ rect: rect, x: rect.x.baseVal.value, y: rect.y.baseVal.value, }); })
                            .sort(function (a, b) { return a.x - b.x; }).sort(function (a, b) { return a.y - b.y; })
                            .map(function (desc, index) { return new Main.Slot(prevNumSlots + index, displayModal, desc.rect); });
                        (_a = this.slots).push.apply(_a, newSlots);
                        this.artHostElem.appendChild(newSvgCopy);
                        return [2];
                }
            });
        });
    };
    Main.prototype.fillSlot = function (slotId, imageFileName) {
        return __awaiter(this, void 0, void 0, function () {
            var slot;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(slotId < this.slots.length)) return [3, 1];
                        slot = this.slots[slotId];
                        if (!slot.isEmpty)
                            throw new Error("slot `" + slotId + "` is already occupied");
                        slot.__fill(imageFileName);
                        return [3, 4];
                    case 1: return [4, this.extendArtwork()];
                    case 2:
                        _a.sent();
                        return [4, this.fillSlot(slotId, imageFileName)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2];
                }
            });
        });
    };
    Main.prototype.setModalSubmission = function (slot) {
        this.modalCurrentSlot = slot;
        this.modal.imageElem.src = slot.imageSource;
        this.modal.messageElem.innerText = slot.messageString;
    };
    Main.prototype.showModal = function () {
        this.modal.baseElem.tabIndex = 0;
        this.modal.navPrev.disabled = false;
        this.modal.navNext.disabled = false;
        this.modal.turnOffScrollElem.style.overflowY = "hidden";
        this.artHostElem.dataset["showModal"] = "";
        this.modal.baseElem.dataset["showModal"] = "";
        this.modal.baseElem.focus();
    };
    Main.prototype.hideModal = function () {
        this.modal.baseElem.tabIndex = -1;
        this.modal.navPrev.disabled = true;
        this.modal.navNext.disabled = true;
        this.modal.turnOffScrollElem.style.overflow = "";
        delete this.artHostElem.dataset["showModal"];
        delete this.modal.baseElem.dataset["showModal"];
    };
    Main.prototype.__addModalListeners = function () {
        var _this = this;
        var modalNavPrev = function () {
            for (var i = _this.modalCurrentSlot.id - 1; i >= 0; i--) {
                var slot = _this.slots[i];
                if (!slot.isEmpty) {
                    _this.setModalSubmission(slot);
                    break;
                }
            }
        };
        var modalNavNext = function () {
            var numSlots = _this.slots.length;
            for (var i = _this.modalCurrentSlot.id + 1; i < numSlots; i++) {
                var slot = _this.slots[i];
                if (!slot.isEmpty) {
                    _this.setModalSubmission(slot);
                    break;
                }
            }
        };
        this.modal.baseElem.addEventListener("keydown", function (ev) {
            if (ev.key === "Escape") {
                _this.hideModal();
            }
            else if (ev.key === "ArrowLeft") {
                modalNavPrev();
            }
            else if (ev.key === "ArrowRight") {
                modalNavNext();
            }
        });
        this.modal.baseElem.addEventListener("click", function (ev) {
            if (ev.target === _this.modal.baseElem) {
                _this.hideModal();
            }
        });
        this.modal.navPrev.onclick = modalNavPrev;
        this.modal.navNext.onclick = modalNavNext;
    };
    return Main;
}());
(function (Main) {
    var Slot = (function () {
        function Slot(id, displayModal, rect) {
            this.id = id;
            this.displayModal = displayModal;
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
        Slot.prototype.__fill = function (imageFileName) {
            var _this = this;
            makeRequest(GITHUB_FILES.urlAssetsGetRaw
                + this.id + "/message.txt").then(function (xhr) {
                _this.__messageString = xhr.responseText;
            });
            var img = this.__image = document.createElementNS(SVG_NSPS, "image");
            img.classList.add("submission__image");
            img.tabIndex = 0;
            img.onclick = function (ev) {
                _this.displayModal(_this);
            };
            var imageSrc = GITHUB_FILES.urlAssetsGetRaw
                + this.id + "/" + imageFileName;
            img.setAttributeNS(XLINK_NSPS, "href", imageSrc);
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
        Object.defineProperty(Slot.prototype, "imageSource", {
            get: function () {
                var _a;
                return (_a = this.__image) === null || _a === void 0 ? void 0 : _a.href.baseVal;
            },
            enumerable: true,
            configurable: true
        });
        Object.defineProperty(Slot.prototype, "messageString", {
            get: function () {
                return this.__messageString;
            },
            enumerable: true,
            configurable: true
        });
        return Slot;
    }());
    Main.Slot = Slot;
    Object.freeze(Slot);
    Object.freeze(Slot.prototype);
})(Main || (Main = {}));
Object.freeze(Main);
Object.freeze(Main.prototype);
var main = new Main();
window.setTimeout(function () {
    document.body.classList.remove("top-no-transitions-pre-load");
}, 200);
//# sourceMappingURL=index.js.map