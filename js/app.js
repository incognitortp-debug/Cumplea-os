
'use strict';

const cfg = window.CUMPLE;
const $ = s => document.querySelector(s);
const $$ = s => [...document.querySelectorAll(s)];

const scenes = $$('.scene');

const reduced = matchMedia(
    '(prefers-reduced-motion: reduce)'
).matches;

let current = 0;
let busy = false;
let epoch = 0;
let sceneStart = performance.now();

let W = 0;
let H = 0;
let dpr = 1;

let particles = [];
let stars = [];

let rotation = 0;
let pitch = 0;
let drag = null;

const timers = new Set();

const later = (fn, ms) => {

    const id = setTimeout(() => {
        timers.delete(id);
        fn();
    }, reduced ? Math.min(ms, 320) : ms);

    timers.add(id);

    return id;
};

function clearTimers() {
    timers.forEach(clearTimeout);
    timers.clear();
}

const rand = (a, b) => a + Math.random() * (b - a);

const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

$$('[data-name]').forEach(n => {
    n.textContent = cfg.nombre;
});

document.title =
    `${cfg.nombre} · El día que nació una estrella`;

for (let i = 0; i < scenes.length; i++) {
    $('#progress').append(document.createElement('i'));
}

function show(n) {

    current = n;

    sceneStart = performance.now();

    scenes.forEach((s, i) => {

        s.hidden = i !== n;

        s.classList.toggle('active', i === n);

    });

    $('#chapter').textContent =
        `${String(n).padStart(2, '0')} / 08`;

    $('#back').hidden = n === 0;

    $$('#progress i').forEach((p, i) => {

        p.classList.toggle('lit', i <= n);

    });

    $('#announcement').textContent =
        scenes[n].getAttribute('aria-label');

    if (n === 6) {
        sizePlanet();
    }

    if (n === 8) {

        burst(W / 2, H * .4, 160);

        later(() => {
            burst(W * .22, H * .34, 95);
        }, 700);

        later(() => {
            burst(W * .78, H * .3, 95);
        }, 1300);

    }

}

function go(n) {

    if (busy || n < 0 || n >= scenes.length) {
        return;
    }

    busy = true;

    clearTimers();

    epoch++;

    $('#veil').dataset.effect = [

        'portal',
        'gift',
        'wish',
        'memory',
        'petals',
        'lantern',
        'orbit',
        'letter',
        'final'

    ][n];

    $('#veil').classList.add('on');

    later(() => {

        show(n);

        $('#veil').classList.remove('on');

        later(() => {
            busy = false;
        }, 650);

    }, 620);

}

function next(delay = 1400) {

    const starting = current;
    const version = epoch;

    later(() => {

        if (current === starting && version === epoch) {

            go(current + 1);

        }

    }, delay);

}

$('#back').onclick = () => go(current - 1);

$('#fullscreen').onclick = async () => {

    try {

        if (document.fullscreenElement) {

            await document.exitFullscreen();

        } else if (document.documentElement.requestFullscreen) {

            await document.documentElement.requestFullscreen();

        } else {

            $('#announcement').textContent =
                'En iPhone puedes añadir la página a la pantalla de inicio.';

        }

    } catch {}

};

$('#door').onclick = () => {

    if (busy || $('#door').classList.contains('open')) return;

    $('#door').classList.add('open');

    burst(W / 2, H * .57, 60);

    chime();

    next(850);

};

$('#gift').onclick = () => {

    if ($('#gift').classList.contains('open')) return;

    $('#gift').classList.add('open');

    $('#giftHint').textContent = cfg.regalo;

    burst(W * .5, H * .53, 130);

    chime();

    next(2600);

};

let candles = 0;

for (let i = 0; i < 5; i++) {

    const b = document.createElement('button');

    b.className = 'candle';

    b.setAttribute('aria-label', `Apagar vela ${i + 1}`);

    b.innerHTML = `
        <span class="wax"></span>
        <span class="flame"></span>
    `;

    b.onclick = () => out(b);

    $('#candles').append(b);

}

function out(b) {

    if (
        !b ||
        b.classList.contains('out') ||
        current !== 2
    ) return;

    b.classList.add('out');

    b.setAttribute('aria-pressed', 'true');

    candles++;

    const r = b.getBoundingClientRect();

    burst(
        r.x + r.width / 2,
        r.y + r.height * .22,
        12,
        'smoke'
    );

    chime(candles);

    $('#cakeHint').textContent =
        `${candles} de 5 velas apagadas`;

    if (candles === 5) {

        $('#cakeHint').textContent =
            '¡Que se cumpla tu deseo!';

        burst(W / 2, H * .47, 125);

        next(1900);

    }

}

let swiping = false;

$('#candles').addEventListener('pointerdown', e => {

    swiping = true;

    out(e.target.closest('.candle'));

});

window.addEventListener('pointermove', e => {

    if (swiping && current === 2) {

        const element = document.elementFromPoint(
            e.clientX,
            e.clientY
        );

        out(element?.closest('.candle'));

    }

});

window.addEventListener('pointerup', () => {

    swiping = false;

});

window.addEventListener('pointercancel', () => {

    swiping = false;

});

let seen = 0;

cfg.recuerdos.slice(0, 4).forEach((m, i) => {

    const b = document.createElement('button');

    const art = document.createElement('div');

    const caption = document.createElement('small');

    b.className = 'photo';

    b.setAttribute('aria-label', m.titulo);

    art.className = 'photo-art';

    if (m.foto) {

        const im = new Image();

        im.src = m.foto;

        im.alt = m.titulo;

        im.onerror = () => {

            art.textContent = m.simbolo || '✦';

        };

        art.append(im);

    } else {

        art.textContent = m.simbolo || '✦';

    }

    caption.textContent = m.titulo;

    b.append(art, caption);

    b.onclick = () => {

        if (!b.classList.contains('seen')) {

            seen++;

            b.classList.add('seen');

            chime(seen);

            $('#photoHint').textContent =
                `${seen} de ${Math.min(4, cfg.recuerdos.length)} recuerdos descubiertos`;

            if (seen === Math.min(4, cfg.recuerdos.length)) {

                next(3300);

            }

        }

        $('#memoryText').hidden = false;

        $('#memoryText').textContent = m.mensaje;

    };

    $('#photos').append(b);

    let start = null;

    let offset = {
        x: 0,
        y: 0
    };

    b.addEventListener('pointerdown', e => {

        start = {
            x: e.clientX,
            y: e.clientY,
            ox: offset.x,
            oy: offset.y
        };

        b.setPointerCapture(e.pointerId);

    });

    b.addEventListener('pointermove', e => {

        if (!start) return;

        offset.x = clamp(
            start.ox + e.clientX - start.x,
            -W * .23,
            W * .23
        );

        offset.y = clamp(
            start.oy + e.clientY - start.y,
            -H * .13,
            H * .13
        );

        b.style.translate =
            `${offset.x}px ${offset.y}px`;

    });

    b.addEventListener('pointerup', () => {
        start = null;
    });

    b.addEventListener('pointercancel', () => {
        start = null;
    });

});

const positions = [

    [12, 64],
    [30, 25],
    [50, 77],
    [70, 29],
    [88, 65]

];

const colors = [

    '#fbb2d9',
    '#c4a2fb',
    '#ffe5a5',
    '#fba3bd',
    '#c4a5fa'

];

let bloomed = 0;

positions.forEach(([x, y], i) => {

    const b = document.createElement('button');

    b.className = 'flower';

    b.style.left = x + '%';
    b.style.top = y + '%';

    b.setAttribute(
        'aria-label',
        `Despertar flor ${i + 1}`
    );

    b.innerHTML = `

        <svg viewBox="0 0 100 130">

            <path
                d="M50 119Q40 85 50 48"
                stroke="#82c9aa"
                stroke-width="4"
                fill="none"
            />

            <path
                d="M49 100Q14 72 23 95Q29 111 49 100M48 86Q81 60 78 82Q70 99 48 86"
                fill="#75ac97"
            />

            <g
                class="petals"
                fill="${colors[i]}"
                stroke="#fff3e8"
                stroke-opacity=".6"
            >

                ${Array.from(
                    { length: 8 },

                    (_, j) => `

                        <ellipse
                            cx="50"
                            cy="25"
                            rx="12"
                            ry="23"
                            transform="rotate(${j * 45} 50 48)"
                        />

                    `
                ).join('')}

                <circle
                    class="core"
                    cx="50"
                    cy="48"
                    r="10"
                />

                <circle
                    cx="47"
                    cy="45"
                    r="3"
                    fill="#fff6d2"
                />

            </g>

        </svg>

    `;

    b.onclick = () => {

        if (b.classList.contains('bloom')) return;

        b.classList.add('bloom');

        bloomed++;

        const r = b.getBoundingClientRect();

        burst(
            r.x + r.width / 2,
            r.y + r.height * .35,
            28,
            'petals'
        );

        chime(bloomed);

        $('#gardenWish').textContent = cfg.deseos[i];

        $('#flowerHint').textContent =
            `${bloomed} de 5 flores despiertas`;

        if (bloomed === 5) {

            burst(W / 2, H * .6, 140, 'petals');

            next(2600);

        }

    };

    $('#flowers').append(b);

});

let released = 0;

const lanternPositions = [

    [10, 55],
    [28, 23],
    [50, 67],
    [72, 24],
    [90, 55]

];

lanternPositions.forEach(([x, y], i) => {

    const b = document.createElement('button');

    b.className = 'lantern';

    b.style.left = x + '%';
    b.style.top = y + '%';

    b.style.setProperty(
        '--delay',
        (-i * .6) + 's'
    );

    b.setAttribute(
        'aria-label',
        `Liberar farol ${i + 1}`
    );

    b.innerHTML = `

        <svg viewBox="0 0 90 120">

            <defs>

                <radialGradient
                    id="l${i}"
                    cx=".5"
                    cy=".82"
                    r=".7">

                    <stop stop-color="#fffbc5"/>

                    <stop
                        offset=".45"
                        stop-color="#ffc96f"
                    />

                    <stop
                        offset="1"
                        stop-color="#b55b48"
                    />

                </radialGradient>

            </defs>

            <path
                d="M17 14Q45 4 73 14L79 75Q45 91 11 75Z"
                fill="url(#l${i})"
                stroke="#ffdda1"
                stroke-width="2"
            />

            <path
                d="M30 11L26 80M59 11L64 80M13 75Q45 84 77 75"
                fill="none"
                stroke="#a96541"
                stroke-opacity=".45"
            />

            <ellipse
                cx="45"
                cy="80"
                rx="17"
                ry="5"
                fill="#ffc269"
            />

            <ellipse
                cx="45"
                cy="79"
                rx="7"
                ry="4"
                fill="#fff7d7"
            />

        </svg>

    `;

    let y0 = 0;

    b.addEventListener('pointerdown', e => {

        y0 = e.clientY;

        b.setPointerCapture(e.pointerId);

    });

    b.addEventListener('pointerup', e => {

        if (y0 - e.clientY > 20) {

            release(b);

        }

    });

    b.onclick = () => release(b);

    $('#lanterns').append(b);

});

function release(b) {

    if (b.classList.contains('flying')) return;

    b.classList.add('flying');

    released++;

    chime(released);

    $('#skyHint').textContent =
        `${released} de 5 deseos liberados`;

    if (released === 5) {

        later(() => {

            $('#skyName').hidden = false;

            nameBurst(cfg.nombre);

            $('#skyHint').textContent =
                'Tu nombre tiene su lugar en el cielo.';

        }, 1400);

        next(4500);

    }

}

const planet = $('#planet');

const px = planet.getContext('2d');

let PW = 0;
let PH = 0;
let hotSeen = 0;

const hotspots = [

    { lon: -.65, lat: -.35 },
    { lon: .8, lat: .18 },
    { lon: 2.65, lat: -.1 }

];

hotspots.forEach((h, i) => {

    const b = document.createElement('button');

    b.className = 'planet-hot';

    b.textContent = '✦';

    b.setAttribute(
        'aria-label',
        `Descubrir estrella ${i + 1}`
    );

    b.onclick = () => {

        if (b.classList.contains('seen')) return;

        b.classList.add('seen');

        hotSeen++;

        chime(hotSeen);

        $('#planetWish').textContent =
            cfg.universo[i];

        $('#planetHint').textContent =
            `${hotSeen} de 3 estrellas descubiertas`;

        if (hotSeen === 3) {

            burst(W / 2, H * .57, 100);

            next(2500);

        }

    };

    h.el = b;

    $('#planetStars').append(b);

});

function sizePlanet() {

    const r = planet.getBoundingClientRect();

    if (!r.width) return;

    PW = r.width;
    PH = r.height;

    planet.width = Math.round(PW * dpr);

    planet.height = Math.round(PH * dpr);

    px.setTransform(dpr, 0, 0, dpr, 0, 0);

}

planet.addEventListener('pointerdown', e => {

    drag = {
        x: e.clientX,
        y: e.clientY
    };

    planet.setPointerCapture(e.pointerId);

});

planet.addEventListener('pointermove', e => {

    if (drag) {

        rotation += (e.clientX - drag.x) * .014;

        pitch = clamp(
            pitch + (e.clientY - drag.y) * .006,
            -.45,
            .45
        );

        drag = {
            x: e.clientX,
            y: e.clientY
        };

    }

});

planet.addEventListener('pointerup', () => {

    drag = null;

});

planet.addEventListener('pointercancel', () => {

    drag = null;

});

planet.addEventListener('keydown', e => {

    if (
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight'
    ) {

        e.preventDefault();

        rotation += e.key === 'ArrowLeft'
            ? -.35
            : .35;

    }

});

const planetDots = Array.from(

    { length: 240 },

    () => ({

        lon: rand(-Math.PI, Math.PI),

        lat: Math.asin(rand(-1, 1)),

        size: rand(.5, 2.5),

        color: Math.random() < .5
            ? '#ffc9df'
            : '#fbe6a9'

    })

);

function drawPlanet(t) {

    if (!PW) return;

    const x = PW / 2;
    const y = PH / 2;
    const R = PW * .34;

    px.clearRect(0, 0, PW, PH);

    const halo = px.createRadialGradient(
        x, y, R * .5,
        x, y, R * 1.5
    );

    halo.addColorStop(0, '#b486ed66');
    halo.addColorStop(.7, '#ae79e52a');
    halo.addColorStop(1, '#ae79e500');

    px.fillStyle = halo;

    px.fillRect(0, 0, PW, PH);

    px.save();

    px.translate(x, y);

    px.rotate(-.35);

    px.strokeStyle = '#e4c0f48a';

    px.lineWidth = 1.8;

    px.beginPath();

    px.ellipse(
        0, 0,
        R * 1.55,
        R * .42,
        0,
        Math.PI,
        Math.PI * 2
    );

    px.stroke();

    px.restore();

    const gradient = px.createRadialGradient(

        x - R * .4,
        y - R * .48,
        R * .03,

        x + R * .28,
        y + R * .28,
        R * 1.32

    );

    gradient.addColorStop(0, '#f8d0f6');
    gradient.addColorStop(.35, '#c99ce5');
    gradient.addColorStop(.7, '#7c5ab1');
    gradient.addColorStop(1, '#2a1c63');

    px.fillStyle = gradient;

    px.beginPath();

    px.arc(x, y, R, 0, 7);

    px.fill();

    px.save();

    px.beginPath();

    px.arc(x, y, R - .4, 0, 7);

    px.clip();

    for (let band = 0; band < 8; band++) {

        px.beginPath();

        for (let j = 0; j <= 70; j++) {

            let xx = x - R + j * R * 2 / 70;

            let yy =
                y - R * .82 +
                band * R * .23 +
                Math.sin(
                    j * .08 + rotation * 1.5 + band
                ) * R * .09 +
                Math.cos(
                    j * .17 - rotation + band
                ) * R * .035;

            j
                ? px.lineTo(xx, yy)
                : px.moveTo(xx, yy);

        }

        px.strokeStyle = band % 2
            ? '#f0a9d236'
            : '#f6dfb637';

        px.lineWidth = R * .11;

        px.stroke();

    }

    for (const p of planetDots) {

        let L = p.lon + rotation;

        let la = p.lat + pitch;

        let z = Math.cos(L) * Math.cos(la);

        if (z < 0) continue;

        let xx =
            x + Math.sin(L) * Math.cos(la) * R;

        let yy =
            y + Math.sin(la) * R;

        px.globalAlpha = z * .75;

        px.fillStyle = p.color;

        px.beginPath();

        px.arc(xx, yy, p.size * z, 0, 7);

        px.fill();

    }

    px.restore();

    px.globalAlpha = 1;

    px.save();

    px.translate(x, y);

    px.rotate(-.35);

    for (let k = 0; k < 3; k++) {

        px.strokeStyle = [

            '#fff0b8b0',
            '#eec9ff80',
            '#ffcce665'

        ][k];

        px.lineWidth = 1.4;

        px.beginPath();

        px.ellipse(

            0,
            0,

            R * (1.43 + k * .12),
            R * (.39 + k * .04),

            0,
            0,
            Math.PI

        );

        px.stroke();

    }

    px.restore();

    for (const h of hotspots) {

        const L = h.lon + rotation;

        const la = h.lat + pitch;

        const z = Math.cos(L) * Math.cos(la);

        h.el.hidden = z < .15;

        h.el.style.left =

            (50 + Math.sin(L) * Math.cos(la) * 34)
            + '%';

        h.el.style.top =

            (50 + Math.sin(la) * 34)
            + '%';

    }

}

$('#letterBody').replaceChildren(

    ...cfg.carta.map(s => {

        const p = document.createElement('p');

        p.textContent = s;

        return p;

    })

);

$('#envelope').onclick = () => {

    if ($('#envelope').classList.contains('open')) {

        return;

    }

    $('#envelope').classList.add('open');

    chime();

    later(() => {

        $('#letter').hidden = false;

        $('#letterHint').hidden = true;

        burst(W / 2, H * .55, 65);

    }, 950);

};

$('#finish').onclick = () => go(8);

$('#restart').onclick = () => location.reload();

const world = $('#world');

const ctx = world.getContext('2d');

const effects = $('#effects');

const fx = effects.getContext('2d');

let backdrop = document.createElement('canvas');

let bg = backdrop.getContext('2d');

let lastBg = -1;

function resize() {

    W = innerWidth;

    H = innerHeight;

    dpr = Math.min(devicePixelRatio || 1, 2);

    for (const [c, g] of [

        [world, ctx],
        [effects, fx]

    ]) {

        c.width = Math.round(W * dpr);

        c.height = Math.round(H * dpr);

        g.setTransform(dpr, 0, 0, dpr, 0, 0);

    }

    backdrop.width = W;

    backdrop.height = H;

    lastBg = -1;

    stars = Array.from(

        {
            length: Math.min(
                260,
                Math.round(W * H / 2200)
            )
        },

        () => ({

            x: Math.random() * W,

            y: Math.random() * H,

            r: rand(.35, 1.65),

            p: rand(0, 7)

        })

    );

    sizePlanet();

}

const schemes = [

    ['#080b25', '#30234f', '#955779'],

    ['#170d32', '#5a2b65', '#b56f87'],

    ['#141335', '#573b75', '#a06186'],

    ['#080d26', '#26204c', '#574668'],

    ['#0b1229', '#3a3457', '#76536b'],

    ['#060e28', '#26345e', '#ad746c'],

    ['#070b21', '#24244a', '#674282'],

    ['#180f30', '#46284f', '#94627d'],

    ['#090b27', '#432c73', '#a66a91']

];

function glow(g, x, y, r, color) {

    const a = g.createRadialGradient(

        x, y, 0,

        x, y, r

    );

    a.addColorStop(0, color);

    a.addColorStop(
        1,
        color.slice(0, 7) + '00'
    );

    g.fillStyle = a;

    g.fillRect(
        x - r,
        y - r,
        r * 2,
        r * 2
    );

}

function mountain(g, base, amp, seed, fill) {

    g.fillStyle = fill;

    g.beginPath();

    g.moveTo(0, H);

    for (let x = 0; x <= W + 8; x += 8) {

        const y =

            H * base +

            Math.sin(x / W * 11 + seed)
                * H * amp * .42 +

            Math.sin(x / W * 23 + seed * 2)
                * H * amp * .25 +

            Math.cos(x / W * 5 + seed)
                * H * amp * .6;

        g.lineTo(x, y);

    }

    g.lineTo(W, H);

    g.fill();

}

function background() {

    lastBg = current;

    const s = schemes[current];

    const g = bg.createLinearGradient(
        0, 0, 0, H
    );

    g.addColorStop(0, s[0]);

    g.addColorStop(.56, s[1]);

    g.addColorStop(.88, s[2]);

    g.addColorStop(1, s[0]);

    bg.fillStyle = g;

    bg.fillRect(0, 0, W, H);

    glow(
        bg,
        W * .5,
        H * .48,
        Math.max(W, H) * .58,
        '#ca7bd23d'
    );

    glow(
        bg,
        W * .14,
        H * .66,
        W * .55,
        '#f6a2b22c'
    );

    glow(
        bg,
        W * .92,
        H * .26,
        W * .65,
        '#8189eb39'
    );

    for (let i = 0; i < 7; i++) {

        bg.save();

        bg.translate(W * .53, H * .42);

        bg.rotate(-.65);

        const a = bg.createRadialGradient(

            0, 0, 0,

            0, 0, Math.max(W, H) * .38

        );

        a.addColorStop(0, '#ded1ef0c');

        a.addColorStop(1, '#d9c2ff00');

        bg.scale(1, .28);

        bg.fillStyle = a;

        bg.fillRect(
            -W,
            -H * 3,
            W * 2,
            H * 6
        );

        bg.restore();

    }

    if ([0, 4, 5, 7].includes(current)) {

        const mx = W * .83;

        const my = H * .36;

        const r = Math.min(W, H) * .072;

        glow(bg, mx, my, r * 4, '#ffe7b94a');

        bg.fillStyle = '#f8dbd9';

        bg.beginPath();

        bg.arc(mx, my, r, 0, 7);

        bg.fill();

        bg.fillStyle = s[1];

        bg.beginPath();

        bg.arc(

            mx + r * .43,

            my - r * .22,

            r * .87,

            0,

            7

        );

        bg.fill();

    }

    if ([0, 4, 5].includes(current)) {

        mountain(bg, .68, .11, 1, '#37314d');

        mountain(bg, .73, .075, 4, '#24273f');

        mountain(bg, .79, .048, 9, '#141c33');

        if (current === 5) {

            const water = bg.createLinearGradient(

                0, H * .76,

                0, H

            );

            water.addColorStop(0, '#3d3d62');

            water.addColorStop(1, '#111a35');

            bg.fillStyle = water;

            bg.fillRect(

                0,

                H * .77,

                W,

                H * .23

            );

        } else {

            mountain(bg, .86, .03, 8, '#101b2b');

            for (
                let i = 0;
                i < Math.min(W * 2, 1000);
                i++
            ) {

                const x = rand(0, W);

                const y = rand(H * .8, H);

                bg.strokeStyle = current === 4

                    ? [
                        '#477b6c',
                        '#485a69',
                        '#af77a4'
                    ][i % 3]

                    : '#38405c';

                bg.globalAlpha = rand(.1, .5);

                bg.beginPath();

                bg.moveTo(x, y);

                bg.lineTo(

                    x + rand(-8, 8),

                    y - rand(3, 24)

                );

                bg.stroke();

            }

            bg.globalAlpha = 1;

            if (current === 4) {

                for (let i = 0; i < 70; i++) {

                    const x = rand(0, W);

                    const y = rand(H * .70, H * .98);

                    const r = rand(2, 6);

                    bg.strokeStyle = '#355d58';

                    bg.lineWidth = 1;

                    bg.beginPath();

                    bg.moveTo(
                        x,
                        y + rand(15, 39)
                    );

                    bg.quadraticCurveTo(

                        x - 7,

                        y + 8,

                        x,

                        y

                    );

                    bg.stroke();

                    glow(
                        bg,
                        x,
                        y,
                        r * 3,
                        '#edb0d54d'
                    );

                    for (let j = 0; j < 5; j++) {

                        const an =
                            j * Math.PI * 2 / 5;

                        bg.fillStyle = [

                            '#d699be',

                            '#ae9ad5',

                            '#d9c6a4'

                        ][i % 3];

                        bg.globalAlpha = rand(.35, .7);

                        bg.beginPath();

                        bg.ellipse(

                            x + Math.cos(an) * r,

                            y + Math.sin(an) * r,

                            r * .8,

                            r * .48,

                            an,

                            0,

                            7

                        );

                        bg.fill();

                    }

                    bg.globalAlpha = 1;

                    bg.fillStyle = '#f4dc99';

                    bg.beginPath();

                    bg.arc(
                        x,
                        y,
                        r * .36,
                        0,
                        7
                    );

                    bg.fill();

                }

            }

        }

    }

    const vign = bg.createRadialGradient(

        W / 2,

        H * .48,

        0,

        W / 2,

        H * .48,

        Math.max(W, H) * .75

    );

    vign.addColorStop(.4, '#05061700');

    vign.addColorStop(1, '#050617a0');

    bg.fillStyle = vign;

    bg.fillRect(0, 0, W, H);

}

function burst(x, y, n = 40, type = 'spark') {

    if (reduced) return;

    for (let i = 0; i < n; i++) {

        let a = rand(0, Math.PI * 2);

        let v = rand(1.2, 8);

        particles.push({

            x,

            y,

            vx: Math.cos(a) * v,

            vy: Math.sin(a) * v - 1,

            life: rand(50, 125),

            max: 125,

            r: rand(1.3, 4.1),

            c: [

                '#ffdb94',

                '#f7b3e1',

                '#d5b7ff',

                '#fff4d7',

                '#a8c6ff'

            ][i % 5],

            type

        });

    }

    if (particles.length > 1100) {

        particles.splice(
            0,
            particles.length - 1100
        );

    }

}

function nameBurst(name) {

    if (reduced) return;

    const c = document.createElement('canvas');

    c.width = W;

    c.height = H;

    const a = c.getContext('2d');

    let size = Math.min(W * .18, 90);

    a.font = `italic ${size}px Georgia`;

    while (
        a.measureText(name).width > W * .82 &&
        size > 10
    ) {

        size--;

        a.font = `italic ${size}px Georgia`;

    }

    a.fillStyle = 'white';

    a.textAlign = 'center';

    a.fillText(

        name,

        W / 2,

        H * .44

    );

    const data = a.getImageData(

        0,

        0,

        W,

        H

    ).data;

    for (let y = 0; y < H; y += 5) {

        for (let x = 0; x < W; x += 5) {

            if (data[(y * W + x) * 4 + 3] > 160) {

                particles.push({

                    x: rand(0, W),

                    y: rand(H * .6, H),

                    tx: x,

                    ty: y,

                    life: 155,

                    max: 155,

                    r: rand(.8, 1.8),

                    c: '#ffe8ad',

                    type: 'name'

                });

            }

        }

    }

}

let frame = 0;

function loop(t) {

    if (lastBg !== current) {

        background();

    }

    ctx.clearRect(0, 0, W, H);

    ctx.drawImage(
        backdrop,
        0,
        0,
        W,
        H
    );

    for (const s of stars) {

        ctx.globalAlpha = reduced

            ? .65

            : .48 + .37 * Math.sin(
                t * .0016 + s.p
            );

        ctx.fillStyle = '#fff2d4';

        ctx.beginPath();

        ctx.arc(
            s.x,
            s.y,
            s.r,
            0,
            7
        );

        ctx.fill();

        if (s.r > 1.4) {

            ctx.strokeStyle = '#f4d4e4';

            ctx.lineWidth = .5;

            ctx.beginPath();

            ctx.moveTo(
                s.x - 4,
                s.y
            );

            ctx.lineTo(
                s.x + 4,
                s.y
            );

            ctx.moveTo(
                s.x,
                s.y - 4
            );

            ctx.lineTo(
                s.x,
                s.y + 4
            );

            ctx.stroke();

        }

    }

    ctx.globalAlpha = 1;

    if (current === 5) {

        for (let i = 0; i < 30; i++) {

            let y = H * (.78 + i * .007);

            let x = W * (
                .5 + .25 * Math.sin(i * 21)
            );

            ctx.strokeStyle =

                `rgba(255,202,145,${
                    .04 + .035 * Math.sin(i + t * .002)
                })`;

            ctx.beginPath();

            ctx.moveTo(
                x - W * .1,
                y
            );

            ctx.lineTo(
                x + W * .1,
                y
            );

            ctx.stroke();

        }

    }

    if (current === 4 && !reduced) {

        for (let i = 0; i < 28; i++) {

            const x = (

                i * 127.7 +

                Math.sin(t * .0007 + i) * 22

            ) % W;

            const y = H * .55 + (

                (

                    i * 37.1 +

                    Math.sin(t * .0009 + i) * 20

                ) % (H * .4)

            );

            glow(
                ctx,
                Math.abs(x),
                y,
                7,
                '#f7efad77'
            );

        }

    }

    if (current === 6) {

        drawPlanet(t);

    }

    fx.clearRect(0, 0, W, H);

    particles = particles.filter(

        p => p.life > 0

    );

    for (const p of particles) {

        p.life--;

        if (p.type === 'name') {

            p.x += (p.tx - p.x) * .045;

            p.y += (p.ty - p.y) * .045;

        } else {

            p.x += p.vx;

            p.y += p.vy;

            p.vx *= .987;

            p.vy += p.type === 'petals'

                ? .035

                : p.type === 'smoke'

                    ? -.03

                    : .035;

        }

        fx.globalAlpha = Math.min(
            1,
            p.life / 25
        );

        fx.fillStyle = p.c;

        fx.save();

        fx.translate(p.x, p.y);

        fx.rotate(p.life * .035);

        if (p.type === 'petals') {

            fx.beginPath();

            fx.ellipse(

                0,

                0,

                p.r * 2.4,

                p.r,

                0,

                0,

                7

            );

            fx.fill();

        } else {

            fx.beginPath();

            fx.arc(
                0,
                0,
                p.r,
                0,
                7
            );

            fx.fill();

        }

        fx.restore();

    }

    fx.globalAlpha = 1;

    if (

        current === 8 &&

        !reduced &&

        frame++ % 64 === 0

    ) {

        burst(

            rand(W * .13, W * .87),

            rand(H * .18, H * .75),

            48

        );

    }

    requestAnimationFrame(loop);

}

let playing = false;

let audio = null;

let ac = null;

let master = null;

let musicTimer = null;

let noteIndex = 0;

const notes = [

    60, 64, 67, 71,

    72, 67, 64, 62,

    57, 60, 64, 69,

    67, 64, 62, 55

];

function tone(midi, gain = .06, length = .8) {

    if (!ac || !playing) return;

    const now = ac.currentTime;

    const o = ac.createOscillator();

    const g = ac.createGain();

    o.type = 'sine';

    o.frequency.value =

        440 * 2 ** ((midi - 69) / 12);

    g.gain.setValueAtTime(

        .0001,

        now

    );

    g.gain.exponentialRampToValueAtTime(

        gain,

        now + .06

    );

    g.gain.exponentialRampToValueAtTime(

        .0001,

        now + length

    );

    o.connect(g).connect(master);

    o.start(now);

    o.stop(now + length + .02);

}

function chime(i = 0) {

    tone(
        72 + i * .8,
        .08,
        .55
    );

}

function playNote() {

    tone(

        notes[noteIndex++ % notes.length],

        .065,

        1.5

    );

}

$('#sound').onclick = async () => {

    try {

        if (playing) {

            playing = false;

            audio?.pause();

            clearInterval(musicTimer);

            if (master) {

                master.gain.value = 0;

            }

        } else {

            if (cfg.musica) {

                audio = audio || new Audio(cfg.musica);

                audio.loop = true;

                audio.volume = .5;

                await audio.play();

                playing = true;

            } else {

                const AC =

                    window.AudioContext ||

                    window.webkitAudioContext;

                if (!AC) return;

                ac = ac || new AC();

                await ac.resume();

                if (!master) {

                    master = ac.createGain();

                    master.connect(ac.destination);

                }

                master.gain.value = .5;

                playing = true;

                playNote();

                musicTimer = setInterval(

                    playNote,

                    540

                );

            }

        }

        $('#sound').setAttribute(

            'aria-pressed',

            String(playing)

        );

        $('#sound').setAttribute(

            'aria-label',

            playing

                ? 'Pausar música'

                : 'Activar música'

        );

        $('#sound').textContent =

            playing ? 'Ⅱ' : '♫';

    } catch {

        $('#announcement').textContent =

            'No se pudo reproducir el audio.';

    }

};

const originalShow = show;

show = function(n) {

    originalShow(n);

    if (n === 0) {

        $('#door').classList.remove('open');

    }

    const done = [

        false,

        $('#gift').classList.contains('open'),

        candles === 5,

        seen === Math.min(
            4,
            cfg.recuerdos.length
        ),

        bloomed === 5,

        released === 5,

        hotSeen === 3

    ];

    const hint = scenes[n].querySelector(

        '.instruction'

    );

    if (done[n] && hint) {

        hint.textContent =

            'Escena completada · toca aquí para continuar →';

        hint.style.pointerEvents = 'auto';

        hint.style.cursor = 'pointer';

        hint.onclick = () => go(n + 1);

    }

};

window.addEventListener(

    'resize',

    resize

);

resize();

show(0);

requestAnimationFrame(loop);
