const typingText = ["Fresher", "MERN Stack Developer"];
let i = 0;
let j = 0;
let isDeleting = false;
let currentText = "";
const typingElement = document.getElementById("typing");

function type() {
    const fullText = typingText[i];

    if (isDeleting) {
        currentText = fullText.substring(0, j--);
    } else {
        currentText = fullText.substring(0, j++);
    }

    typingElement.innerHTML = currentText;

    if (!isDeleting && j === fullText.length + 1) {
        isDeleting = true;
        setTimeout(type, 1000);
        return;
    }

    if (isDeleting && j === 0) {
        isDeleting = false;
        i = (i + 1) % typingText.length;
    }

    setTimeout(type, isDeleting ? 50 : 100);
}

window.addEventListener("load", () => {
    
    type();

    // Smooth fade-in animation
    const left = document.querySelector(".home-left");
    const rightElements = document.querySelectorAll(
        ".home-right h1, .home-right h3, .home-right p, .home-right a"
    );

    if (left) {
        left.classList.add("active");
    }

    rightElements.forEach((el, index) => {
        setTimeout(() => {
            el.classList.add("active");
        }, index * 200);
    });
});