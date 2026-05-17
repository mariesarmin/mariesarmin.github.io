window.flowerState = {
    scrollProgress: 0
};

document.addEventListener("DOMContentLoaded", () => {

    const canvas = document.getElementById("c");
    const ctx = canvas.getContext("2d");

    const loadingScreen = document.getElementById("loading-screen");

    const CLUSTER_RADIUS = 0.08;
    const CLUSTER_STRENGTH = 0.35;

    const TOTAL_FLOWERS = 12;

    let w = 0;
    let h = 0;

    let flowers = [];
    let images = [];

    let scrollTarget = 0;
    let scroll = 0;

    let animationStarted = false;

    function rand(min, max) {
        return Math.random() * (max - min) + min;
    }

    function smoothstep(t) {
        return t * t * (3 - 2 * t);
    }

    function centerWeight(x, sigma = 0.55) {
        return Math.exp(-(x * x) / (2 * sigma * sigma));
    }

    let lastWidth = 0;

    function resize() {
        const dpr = window.devicePixelRatio || 1;
        const newWidth = window.innerWidth;
        const newHeight = window.visualViewport
            ? window.visualViewport.height
            : window.innerHeight;

        canvas.width = newWidth * dpr;
        canvas.height = newHeight * dpr;

        canvas.style.width = newWidth + "px";
        canvas.style.height = newHeight + "px";

        w = newWidth;
        h = newHeight;

        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const widthChanged = Math.abs(newWidth - lastWidth) > 20;

        if (images.length && widthChanged) {
            buildFlowers();
        }

        lastWidth = newWidth;
    }

    function buildFlowers() {
        flowers = [];

        const mobile = window.innerWidth < 768;
        const flowerCount = mobile ? 100 : 500;

        const temp = [];

        for (let i = 0; i < flowerCount; i++) {

            const r = Math.random();
            let layer;

            if (r < 0.20) layer = 0;
            else if (r < 0.50) layer = 1;
            else layer = 2;

            temp.push({
                layer,
                nx: Math.random(),
                ny: Math.random()
            });
        }

        if (!mobile) {
            for (let i = 0; i < temp.length; i++) {
                const a = temp[i];

                let ax = a.nx;
                let ay = a.ny;

                for (let j = 0; j < temp.length; j++) {
                    if (i === j) continue;

                    const b = temp[j];
                    if (a.layer !== b.layer) continue;

                    const dx = b.nx - a.nx;
                    const dy = b.ny - a.ny;

                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < CLUSTER_RADIUS && dist > 0) {
                        const force =
                            (1 - dist / CLUSTER_RADIUS) * CLUSTER_STRENGTH;

                        ax += dx * force * 0.5;
                        ay += dy * force * 0.5;
                    }
                }

                temp[i].nx = Math.min(1, Math.max(0, ax));
                temp[i].ny = Math.min(1, Math.max(0, ay));
            }
        }

        flowers = temp.map((f) => {

            const layerParallax =
                f.layer === 0 ? 1.0 :
                    f.layer === 1 ? 0.65 :
                        0.35;

            const size =
                mobile
                    ? (
                        f.layer === 0 ? 95 + Math.random() * 30 :
                            f.layer === 1 ? 70 + Math.random() * 20 :
                                55 + Math.random() * 15
                    )
                    : (
                        f.layer === 0 ? 150 + Math.random() * 60 :
                            f.layer === 1 ? 100 + Math.random() * 40 :
                                80 + Math.random() * 30
                    );

            return {
                x: f.nx,
                y: f.ny,
                layer: f.layer,
                size,
                flipX: Math.random() < 0.5 ? -1 : 1,
                phase: rand(0, Math.PI * 2),
                speed: rand(0.6, 1.3),
                layerParallax
            };
        });
    }

    function loadImages() {
        let loaded = 0;

        for (let i = 1; i <= TOTAL_FLOWERS; i++) {
            const img = new Image();

            img.onload = () => {
                img.aspect = img.naturalHeight / img.naturalWidth;

                images.push(img);
                loaded++;

                if (loaded === TOTAL_FLOWERS) {
                    resize();
                    buildFlowers();

                    requestAnimationFrame(draw);

                    setTimeout(() => {
                        canvas.classList.add("visible");
                        loadingScreen.classList.add("reveal");
                    }, 350);

                    setTimeout(() => {
                        loadingScreen.remove();
                    }, 1800);

                    animationStarted = true;
                }
            };

            img.onerror = () => {
                console.warn("Failed to load:", img.src);
                loaded++;

                if (loaded === TOTAL_FLOWERS && !animationStarted) {
                    resize();
                    buildFlowers();
                    requestAnimationFrame(draw);
                }
            };

            img.src = `assets/flowers/flower_${i}.png`;
        }
    }

    function draw(time) {
        scroll += (scrollTarget - scroll) * 0.08;

        const eased = smoothstep(Math.min(scroll * 1.7, 1));

        window.flowerState.scrollProgress = eased;

        ctx.clearRect(0, 0, w, h);

        const centerX = w / 2;
        const t = time * 0.0012;
        const mobile = w < 768;

        const FIELD_HEIGHT = h * 0.20;
        const FIELD_TOP = h - FIELD_HEIGHT;

        for (const f of flowers) {

            const motion =
                f.layer === 0 ? 1.0 :
                    f.layer === 1 ? 0.6 :
                        0.25;

            const windScale =
                mobile
                    ? (
                        f.layer === 0 ? 0.55 :
                            f.layer === 1 ? 0.30 :
                                0.12
                    )
                    : (
                        f.layer === 0 ? 1.2 :
                            f.layer === 1 ? 0.6 :
                                0.25
                    );

            const xBase = f.x * w;
            const yBase = FIELD_TOP + f.y * FIELD_HEIGHT;

            const dx = (xBase - centerX) / centerX;

            const driftY =
                Math.sin(t * f.speed + f.phase) *
                4 *
                windScale *
                motion;

            const curtainStrength = mobile ? 100 : 200;
            const curtainGap = mobile ? 35 : 200;

            const weight = centerWeight(dx);

            const push = dx * eased * curtainStrength * weight;
            const gap = dx * eased * curtainGap * (1 - Math.abs(dx));

            const x = xBase + (push + gap) * f.layerParallax;

            const maxSink = mobile ? h * 0.33 : h * 0.33;
            const sink = eased * maxSink * f.layerParallax;

            const y = yBase + driftY + sink;

            const rot =
                (
                    Math.sin(t * f.speed + f.phase) * 4 +
                    Math.sin(t * 0.35 + f.phase * 1.7) * 2
                ) * windScale;

            const img =
                images[(f.layer * 3 + Math.floor(f.phase * 10)) % images.length];

            if (!img || !img.complete || img.naturalWidth === 0) {
                continue;
            }

            const drawW = f.size;
            const drawH = drawW * img.aspect;

            ctx.save();

            ctx.translate(x, y);
            ctx.rotate(rot * Math.PI / 180);

            if (f.flipX === -1) {
                ctx.scale(-1, 1);
            }

            ctx.drawImage(
                img,
                -drawW / 2,
                -drawH / 2,
                drawW,
                drawH
            );

            ctx.restore();
        }

        requestAnimationFrame(draw);
    }

    window.addEventListener("scroll", () => {
        const max = document.body.scrollHeight - window.innerHeight;
        scrollTarget = max > 0 ? window.scrollY / max : 0;
    });

    window.addEventListener("resize", resize);

    loadImages();
});