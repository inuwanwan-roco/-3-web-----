
document.addEventListener("DOMContentLoaded", () => {
    const container = document.getElementById("footer-cat");
    if (!container) return;
    const catAnimation = lottie.loadAnimation({
        container: container,
        renderer: "svg",
        loop: true,
        autoplay: true,
        path: "assets/lottie/black-cat.json"
    });
    catAnimation.setSpeed(0.8);
    gsap.to(".p-footer__cat",{
        opacity:1,
        y:0,
        duration:1.2,
        ease:"power3.out",
        scrollTrigger:{
            trigger:".p-footer",
            start:"top 80%",
            toggleActions:"play none none reverse"
        }
    });
});