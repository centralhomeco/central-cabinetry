(function() {
    const SUPABASE_URL = 'https://apxelbabvviuwqpfivtr.supabase.co';
    const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFweGVsYmFidnZpdXdxcGZpdnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2NjEyOTYsImV4cCI6MjA5OTIzNzI5Nn0.EWt2FRAkJH86Is9P_uDjKDXnJ0O1J2qdg_BuctQavvY';

    const code = document.body.getAttribute('data-door-code');
    if (!code) return;

    fetch(`${SUPABASE_URL}/rest/v1/door_styles?code=eq.${code}&select=code,name,style_type,image_url`, {
        headers: { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` }
    })
    .then(function(res) { return res.json(); })
    .then(function(rows) {
        const s = rows && rows[0];
        if (!s) return;

        document.querySelectorAll('[data-ck="page-title"]').forEach(function(el) {
            el.textContent = `(${s.code}) ${s.name}`;
        });
        document.querySelectorAll('[data-ck="swatch-image"]').forEach(function(el) {
            if (s.image_url) el.src = s.image_url;
        });
        document.querySelectorAll('[data-ck="spec-style"]').forEach(function(el) {
            el.textContent = s.style_type;
        });
        document.querySelectorAll('[data-ck="spec-code"]').forEach(function(el) {
            el.textContent = s.code;
        });
        document.querySelectorAll('[data-ck="spec-door_type"]').forEach(function(el) {
            el.textContent = s.style_type;
        });
        document.title = `${s.name} | Central Home Good`;
    })
    .catch(function(err) { console.error('Door style detail load error:', err); });
})();
