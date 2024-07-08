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


{/* <a aria-label="Open the menu" tabindex="0">
                        <i id="menuIcon" aria-hidden="true" data-icon="&#9776;" class="fa-solid fa-bars"></i>
                    </a> */}
document.querySelector("#menuIcon").addEventListener("click", openMenu);
document.querySelector("#menuIconClose").addEventListener("click", closeMenu);