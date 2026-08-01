(function () {
    var googleAdsId = 'AW-17836315268';
    var directionsConversion = googleAdsId + '/cb6xCJqz0dgcEISlgrlC';

    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', googleAdsId);

    function trackEvent(eventName, params) {
        if (typeof window.gtag !== 'function') return;
        window.gtag('event', eventName, params || {});
    }

    window.centralHomeTrackLead = function (leadType) {
        trackEvent('generate_lead', {
            event_category: 'Lead',
            event_label: leadType || 'website'
        });
    };

    window.centralHomeTrackDirections = function () {
        trackEvent('conversion', {
            send_to: directionsConversion
        });
    };

    document.addEventListener('click', function (event) {
        var link = event.target.closest && event.target.closest('a');
        if (!link) return;

        var href = link.getAttribute('href') || '';
        if (href.indexOf('tel:') === 0) {
            window.centralHomeTrackLead('phone_click');
        }
        if (link.hasAttribute('data-track-directions')) {
            window.centralHomeTrackDirections();
        }
    });
})();
