INSERT INTO public.rooms (
    room_number,
    type,
    price_per_night,
    max_occupancy,
    status,
    image_url
)
SELECT
    'FR1',
    'Full Resort',
    20000,
    24,
    'Clean',
    null
WHERE NOT EXISTS (
    SELECT 1
    FROM public.rooms
    WHERE room_number = 'FR1'
       OR lower(type) = lower('Full Resort')
);
