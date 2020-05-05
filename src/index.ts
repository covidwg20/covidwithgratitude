
const artHousesHost   = document.querySelector(".main-scroll__houses") as HTMLElement;
const artBgHost       = document.querySelector(".main-scroll__background") as HTMLElement;
const submissionsHost = document.querySelector(".main-scroll__content") as HTMLElement;

{const xhr = new XMLHttpRequest();
xhr.open("GET", "assets/images/houses.svg");
// Following line is just to be on the safe side;
// not needed if your server delivers SVG with correct MIME type
// xhr.overrideMimeType("image/svg+xml");
xhr.send("");
xhr.onload = (ev) => {
    artHousesHost.appendChild(xhr!.responseXML!.documentElement);
}};

