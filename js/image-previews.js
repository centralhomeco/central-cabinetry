(function() {
    const previews = window.CENTRAL_HOME_IMAGE_PREVIEWS || {};
    const backgroundObserver = 'IntersectionObserver' in window
        ? new IntersectionObserver(function(entries) {
            entries.forEach(function(entry) {
                if (!entry.isIntersecting) return;
                const el = entry.target;
                el.style.backgroundImage = `url("${el.dataset.previewBackground.replace(/["\\]/g, '\\$&')}")`;
                delete el.dataset.previewBackground;
                backgroundObserver.unobserve(el);
            });
        }, { rootMargin: '300px 0px' })
        : null;

    function previewUrl(original) {
        return previews[original] || original || '';
    }

    function setImage(img, original, options) {
        if (!img || !original) return;
        const settings = options || {};
        img.dataset.fullSrc = original;
        img.src = settings.preview === false ? original : previewUrl(original);
        img.decoding = 'async';
        if (!settings.eager) img.loading = 'lazy';
        if (settings.fetchPriority) img.fetchPriority = settings.fetchPriority;
    }

    function setBackground(el, original, options) {
        if (!el || !original) return;
        const settings = options || {};
        const source = settings.preview === false ? original : previewUrl(original);
        el.dataset.fullSrc = original;
        if (settings.eager || !backgroundObserver) {
            el.style.backgroundImage = `url("${source.replace(/["\\]/g, '\\$&')}")`;
            return;
        }
        el.style.backgroundImage = 'none';
        el.dataset.previewBackground = source;
        backgroundObserver.observe(el);
    }

    function fullSource(value) {
        if (!value) return '';
        if (typeof value === 'string') return value;
        return value.dataset && value.dataset.fullSrc ? value.dataset.fullSrc : value.src || '';
    }

    window.centralHomeImages = { previewUrl, setImage, setBackground, fullSource };
})();
