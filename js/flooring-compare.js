(function() {
    const SUPABASE_URL = 'https://apxelbabvviuwqpfivtr.supabase.co';
    const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFweGVsYmFidnZpdXdxcGZpdnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2NjEyOTYsImV4cCI6MjA5OTIzNzI5Nn0.EWt2FRAkJH86Is9P_uDjKDXnJ0O1J2qdg_BuctQavvY';

    fetch(`${SUPABASE_URL}/rest/v1/flooring_products?active=eq.true&select=category`, {
        headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` }
    })
        .then(function(response) {
            if (!response.ok) throw new Error('Unable to load flooring counts');
            return response.json();
        })
        .then(function(products) {
            if (!Array.isArray(products)) return;
            const counts = products.reduce(function(result, product) {
                result[product.category] = (result[product.category] || 0) + 1;
                return result;
            }, {});
            document.querySelectorAll('[data-product-count]').forEach(function(element) {
                const category = element.getAttribute('data-product-count');
                if (counts[category] != null) element.textContent = counts[category];
            });
        })
        .catch(function() {
            // Keep the verified fallback counts rendered in the page.
        });
})();
