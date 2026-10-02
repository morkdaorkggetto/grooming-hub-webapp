-- GH-109, solo il pet sintetico: ritratto locale e conferimento Bronzo.
update public.pets set owner_photo_url='/icons/icon-192.png',awarded_fidelity_tier='bronze'
where id='00000000-0000-4000-8109-000000000001' and qr_token='ghp_gh109_probe_1';
