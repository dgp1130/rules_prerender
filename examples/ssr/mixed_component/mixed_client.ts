if (document.readyState === 'complete' || document.readyState === 'interactive') {
    replace();
} else {
    document.addEventListener('readystatechange', onReadyStateChanged);
}

function onReadyStateChanged(): void {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        replace();
        document.removeEventListener('readystatechange', onReadyStateChanged);
    }
}

function replace(): void {
    const els = Array.from(document.getElementsByClassName('mixed-replace'));
    for (const el of els) {
        el.textContent = `CSR: Viewport width is ${window.innerWidth}px.`;
    }
}
