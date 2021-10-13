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
    const el = document.getElementById('mixed-replace');
    if (!el) throw new Error('Failed to find element `#mixed-replace`.');
    el.innerText = `CSR: Viewport width is ${window.innerWidth}px.`;
}
