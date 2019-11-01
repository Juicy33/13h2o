const nav = document.querySelector('nav');
const btn = document.querySelector('.menu-btn');
const icons = document.querySelectorAll('use');
const btnCircle = document.querySelector(".ring");

TweenMax.set(icons, {
    y: 5,
    opacity: 0 });

TweenMax.set(nav, {
    opacity: 0,
    scaleY: 0,
    scaleX: 0,
    transformOrigin: "center center" });


btnTl = new TimelineMax({ paused: true });
btnTl.to(btn, 0.45, {
        rotation: 15,
        scale: 0.85,
        ease: Power1.easeOut },
    'in').
to(btnCircle, 0.4, {
        scale: 1 },
    'in').
to(btnCircle, 0.2, {
        scale: 0 },
    'out').
to(btn, 0.3, {
        rotation: 45,
        scale: 1,
        ease: Back.easeOut.config(4) },
    'out').
to(btn, 0.25, {
    rotation: 50 }).

to(btn, 0.25, {
    rotation: 45 });


navTl = new TimelineMax({
    paused: true });


navTl.to(nav, 0.3, {
    y: 0,
    opacity: 1,
    visibility: 'visible',
    scaleY: 1,
    scaleX: 1.02,
    ease: Expo.easeIn }).

to(nav, 0.3, {
    scaleX: 1,
    ease: Power1.easeOut }).

to(nav, 0.25, {
    scaleX: 1.015,
    ease: Power1.easeOut }).

to(nav, 0.25, {
    scaleX: 1,
    ease: Power1.easeOut });

navTl.timeScale(0.9);

iconsTl = new TimelineMax({
    paused: true,
    onComplete: () => {
        TweenMax.set(icons, { clearProps: "all" });
    } });


iconsTl.staggerFromTo(icons, 0.3, {
        y: 5,
        opacity: 0 },
    {
        y: -2,
        opacity: 1 },
    0.05).
to(icons, 0.5, {
    y: 0,
    ease: Back.easeOut.config(4) });


masterTl = new TimelineMax({ paused: true });
masterTl.add(btnTl.play(), 0).
add(navTl.play(), 0.3).
add(iconsTl.play(), 0.55);

// Event Listener for button
btn.addEventListener('click', () => {
    masterTl.play();
    if (!masterTl.isActive() && masterTl.progress(1)) {
        // Out animation
        const outTl = new TimelineMax({ onComplete: () => {
                masterTl.pause();
                masterTl.progress(0);
            } });

        outTl.to(nav, 0.3, {
                y: 110,
                scale: 0,
                opacity: 0 },
            'out').
        to(btn, 0.3, {
                rotation: -10 },
            'out').
        to(btn, 0.3, {
                rotation: 0 },
            'out+=0.3');
    }
});

// Set active nav item
let links = document.querySelectorAll('a');

const clickHandler = el => {
    links.forEach(link => {
        link.classList.remove('active');
    });
    el.classList.add('active');
};
links.forEach(link => {
    link.addEventListener('click', e => {
        e.preventDefault();
        clickHandler(e.currentTarget);
    });
});