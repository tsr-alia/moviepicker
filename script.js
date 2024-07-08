function openMenu() {
    document.querySelector("#mainMenu").style.display = "block";
    document.querySelector("#liOpen").style.display = "none";
    document.querySelector("#liClose").style.display = "block";
}

function closeMenu() {
    document.querySelector("#mainMenu").style.display = "none";
    document.querySelector("#liOpen").style.display = "block";
    document.querySelector("#liClose").style.display = "none";
}

document.querySelector("#menuIcon").addEventListener("click", openMenu);
document.querySelector("#menuIconClose").addEventListener("click", closeMenu);