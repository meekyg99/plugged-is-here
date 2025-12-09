insert into public.categories (name, slug, gender, description)
values
  ('Sport', 'sport', 'unisex', 'Athletic-inspired fashion and gear'),
  ('Jersey', 'jersey', 'unisex', 'Sport jerseys and tops'),
  ('Shorts', 'shorts', 'unisex', 'Athletic shorts'),
  ('Slides', 'slides', 'unisex', 'Sport slides and sandals')
on conflict (slug) do update set
  name = excluded.name,
  gender = excluded.gender,
  description = excluded.description;
