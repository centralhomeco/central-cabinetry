(function() {
    const SUPABASE_URL = 'https://apxelbabvviuwqpfivtr.supabase.co';
    const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFweGVsYmFidnZpdXdxcGZpdnRyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODM2NjEyOTYsImV4cCI6MjA5OTIzNzI5Nn0.EWt2FRAkJH86Is9P_uDjKDXnJ0O1J2qdg_BuctQavvY';

    function h(withAuth) { return { 'apikey': SUPABASE_ANON, 'Authorization': `Bearer ${SUPABASE_ANON}` }; }

    const params = new URLSearchParams(window.location.search);
    const code = (params.get('code') || '').toUpperCase();

    if (!code) {
        window.location.href = 'door-styles.html';
        return;
    }

    // Global content (phone, hours, footer, shared cabinet specs)
    fetch(`${SUPABASE_URL}/rest/v1/site_content?page=eq.global&select=content_key,content_type,value`, { headers: h() })
        .then(function(res) { return res.json(); })
        .then(function(rows) {
            if (!Array.isArray(rows)) return;
            rows.forEach(function(row) {
                if (!row.value) return;
                document.querySelectorAll('[data-ck="' + row.content_key + '"]').forEach(function(el) {
                    if (row.content_type === 'image') {
                        if (el.tagName === 'IMG') el.src = row.value;
                        else el.style.backgroundImage = "url('" + row.value + "')";
                    } else {
                        el.textContent = row.value;
                    }
                });
            });
        })
        .catch(function(err) { console.error('Global content load error:', err); });

    // This door style
    fetch(`${SUPABASE_URL}/rest/v1/door_styles?code=eq.${code}&select=code,name,style_type,image_url,banner_image,box_material,drawer_slides,hinges,face_frame,shelves,interior_finish,overlay`, { headers: h() })
        .then(function(res) { return res.json(); })
        .then(function(rows) {
            const s = rows && rows[0];
            if (!s) {
                document.getElementById('detail-content').innerHTML = '<p style="padding:60px;text-align:center;color:#888">Door style not found. <a href="door-styles.html">Back to all styles</a></p>';
                return;
            }

            document.title = `${s.name} | Central Home Good`;
            document.querySelectorAll('[data-ck="page-title"]').forEach(function(el) { el.textContent = `(${s.code}) ${s.name}`; });
            document.querySelectorAll('[data-ck="breadcrumb-name"]').forEach(function(el) { el.textContent = s.name; });
            document.querySelectorAll('[data-ck="spec-style"]').forEach(function(el) { el.textContent = s.style_type; });
            document.querySelectorAll('[data-ck="spec-code"]').forEach(function(el) { el.textContent = s.code; });
            document.querySelectorAll('[data-ck="spec-door_type"]').forEach(function(el) { el.textContent = s.style_type; });
            document.querySelectorAll('[data-ck="spec-box_material"]').forEach(function(el) { el.textContent = s.box_material || ''; });
            document.querySelectorAll('[data-ck="spec-drawer_slides"]').forEach(function(el) { el.textContent = s.drawer_slides || ''; });
            document.querySelectorAll('[data-ck="spec-hinges"]').forEach(function(el) { el.textContent = s.hinges || ''; });
            document.querySelectorAll('[data-ck="spec-face_frame"]').forEach(function(el) { el.textContent = s.face_frame || ''; });
            document.querySelectorAll('[data-ck="spec-shelves"]').forEach(function(el) { el.textContent = s.shelves || ''; });
            document.querySelectorAll('[data-ck="spec-interior_finish"]').forEach(function(el) { el.textContent = s.interior_finish || ''; });
            document.querySelectorAll('[data-ck="spec-overlay"]').forEach(function(el) { el.textContent = s.overlay || ''; });

            const banner = document.querySelector('[data-ck="banner-image"]');
            if (banner) banner.style.backgroundImage = "url('" + (s.banner_image || 'images/lifestyle/gallery_1.jpg') + "')";

            const swatch = document.querySelector('[data-ck="swatch-image"]');
            if (swatch && s.image_url) { swatch.src = s.image_url; swatch.alt = s.name + ' door swatch'; }

            // Related styles: same style_type, excluding this one
            fetch(`${SUPABASE_URL}/rest/v1/door_styles?style_type=eq.${encodeURIComponent(s.style_type)}&active=eq.true&order=sort_order`, { headers: h() })
                .then(function(res) { return res.json(); })
                .then(function(list) {
                    const related = (list || []).filter(function(x) { return x.code !== s.code; }).slice(0, 4);
                    const wrap = document.getElementById('related-grid');
                    const heading = document.getElementById('related-heading');
                    if (heading) heading.textContent = `More ${s.style_type} Styles`;
                    if (wrap) {
                        wrap.innerHTML = related.map(function(r) {
                            return `
        <a href="door-style-detail.html?code=${r.code.toLowerCase()}" class="related-card">
            <img src="${r.image_url || ''}" alt="${r.name}">
            <span>${r.name} &rsaquo;</span>
        </a>`;
                        }).join('');
                    }
                })
                .catch(function(err) { console.error('Related styles load error:', err); });
        })
        .catch(function(err) { console.error('Door style load error:', err); });
})();
