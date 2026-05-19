const lightbox = document.getElementById("lightbox");
const lightboxImage = document.getElementById("lightbox-image");
const lightboxClose = document.getElementById("lightbox-close");
const lightboxPrev = document.getElementById("lightbox-prev");
const lightboxNext = document.getElementById("lightbox-next");
const galleryPreview = document.getElementById("gallery-preview");

const galleryImages = [
    "assets/gallery/img1.webp",
    "assets/gallery/img2.webp",
    "assets/gallery/img3.webp",
    "assets/gallery/img4.webp",
    "assets/gallery/img5.webp",
    "assets/gallery/img6.webp",
    "assets/gallery/img7.webp",
    "assets/gallery/img8.webp",
    "assets/gallery/img9.webp"
];

const preloadedGallery = [];

galleryImages.forEach((src) => {
    const img = new Image();
    img.src = src;
    img.decoding = "async";
    preloadedGallery.push(img);
});

let currentGalleryIndex = 0;
let touchStartX = 0;

function updateImage() {
    lightboxImage.src = preloadedGallery[currentGalleryIndex].src;
}

function openLightbox() {
    updateImage();
    lightbox.classList.add("open");
    document.body.classList.add("menu-open");
}

function closeLightbox() {
    lightbox.classList.remove("open");
    document.body.classList.remove("menu-open");
}

function nextImage() {
    currentGalleryIndex =
        (currentGalleryIndex + 1) % galleryImages.length;
    updateImage();
}

function prevImage() {
    currentGalleryIndex =
        (currentGalleryIndex - 1 + galleryImages.length) % galleryImages.length;
    updateImage();
}

galleryPreview.addEventListener("click", openLightbox);
lightboxClose.addEventListener("click", closeLightbox);

lightboxNext.addEventListener("click", (e) => {
    e.stopPropagation();
    nextImage();
});

lightboxPrev.addEventListener("click", (e) => {
    e.stopPropagation();
    prevImage();
});

lightbox.addEventListener("click", (e) => {
    if (e.target === lightbox) closeLightbox();
});

lightbox.addEventListener("touchstart", (e) => {
    touchStartX = e.changedTouches[0].screenX;
}, { passive: true });

lightbox.addEventListener("touchend", (e) => {
    const delta = e.changedTouches[0].screenX - touchStartX;

    if (Math.abs(delta) < 60) return;
    delta < 0 ? nextImage() : prevImage();
}, { passive: true });