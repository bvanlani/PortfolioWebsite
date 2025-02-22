//alert("It's working!");
const currentUrl = window.location.href;
const link = document.getElementById("currentLink");

if(currentUrl.includes(link.href)){
    link.style.pointerEvents = "none";
}