document.addEventListener("DOMContentLoaded", () => {
    const body = document.body;
    const heroLogo = document.getElementById("hero-logo");

    const mobileMenu = document.getElementById("mobile-menu");
    const menuToggle = document.getElementById("menu-toggle");
    const menuClose = document.getElementById("menu-close");

    const mobileLinks = document.querySelectorAll("#mobile-menu a");
    const desktopLinks = document.querySelectorAll("#sticky-header a");

    function clamp(v, min, max) {
        return Math.max(min, Math.min(max, v));
    }

    function lerp(a, b, t) {
        return a + (b - a) * t;
    }

    function updateUI() {
        const mobile = window.innerWidth < 768;

        const max = document.body.scrollHeight - window.innerHeight;
        const progress = max > 0 ? window.scrollY / max : 0;

        const morphEnd = 0.012;
        const t = clamp(progress / morphEnd, 0, 1);

        const scale = lerp(1, mobile ? 0.18 : 0.15, t);
        const moveY = lerp(0, mobile ? -190 : -245, t);

        heroLogo.style.position = "fixed";
        heroLogo.style.left = "50%";
        heroLogo.style.top = mobile ? "0px" : "-10vh";
        heroLogo.style.zIndex = "1300";

        heroLogo.style.transform =
            `translateX(-50%) translateY(${moveY}px) scale(${scale})`;

        if (progress > 0.002) {
            body.classList.add("header-active");
        } else {
            body.classList.remove("header-active");
        }

        requestAnimationFrame(updateUI);
    }

    function openMenu() {
        mobileMenu.classList.add("open");
        body.classList.add("menu-open");
    }

    function closeMenu() {
        mobileMenu.classList.remove("open");
        body.classList.remove("menu-open");
    }

    menuToggle.addEventListener("click", openMenu);
    menuClose.addEventListener("click", () => {
        mobileMenu.classList.remove("open");
        document.body.classList.remove("menu-open");
    });
    mobileLinks.forEach(link => {
        link.addEventListener("click", closeMenu);
    });

    function handleNavClick(e) {
        const href = e.currentTarget.getAttribute("href");
        if (!href?.startsWith("#")) return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        target.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }

    desktopLinks.forEach(link => link.addEventListener("click", handleNavClick));
    mobileLinks.forEach(link => link.addEventListener("click", handleNavClick));

    requestAnimationFrame(updateUI);
});