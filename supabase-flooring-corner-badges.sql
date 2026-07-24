alter table public.flooring_products
    add column if not exists corner_image_url text,
    add column if not exists corner_position text default 'top-left'
        check (corner_position in ('top-left', 'top-right'));
