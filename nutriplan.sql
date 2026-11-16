-- 1. Buat Tabel meals (Katalog Makanan)
CREATE TABLE meals (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    name text NOT NULL,
    category text NOT NULL DEFAULT 'Lunch' CHECK (
        category IN (
            'Breakfast',
            'Lunch',
            'Dinner',
            'Snack'
        )
    ),
    calories integer NOT NULL DEFAULT 0,
    protein numeric(6, 2) DEFAULT 0,
    carbs numeric(6, 2) DEFAULT 0,
    fat numeric(6, 2) DEFAULT 0,
    serving_size text DEFAULT '1 serving',
    description text DEFAULT '',
    image_url text DEFAULT '',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- 2. Buat Tabel meal_plans (Rencana Makan Harian Pengguna)
CREATE TABLE meal_plans (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id text NOT NULL,
    date date NOT NULL DEFAULT CURRENT_DATE,
    meal_id bigint NOT NULL REFERENCES meals (id) ON DELETE CASCADE,
    meal_type text NOT NULL DEFAULT 'lunch' CHECK (
        meal_type IN (
            'breakfast',
            'lunch',
            'dinner',
            'snack'
        )
    ),
    servings numeric(4, 2) DEFAULT 1,
    created_at timestamptz DEFAULT now()
);

-- 3. Buat Tabel favorites (Menu Favorit Pengguna)
CREATE TABLE favorites (
    id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    user_id text NOT NULL,
    meal_id bigint NOT NULL REFERENCES meals (id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE (user_id, meal_id)
);

-- 4. Indeks Performa
CREATE INDEX idx_meal_plans_user_date ON meal_plans (user_id, date);

CREATE INDEX idx_meal_plans_meal ON meal_plans (meal_id);

CREATE INDEX idx_favorites_user ON favorites (user_id);

CREATE INDEX idx_favorites_meal ON favorites (meal_id);

CREATE INDEX idx_meals_category ON meals (category);

-- 5. Row Level Security (Akses Publik via anon key)
ALTER TABLE meals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read meals" ON meals FOR SELECT USING (true);

CREATE POLICY "Public insert meals" ON meals FOR INSERT
WITH
    CHECK (true);

CREATE POLICY "Public update meals" ON meals FOR UPDATE USING (true);

CREATE POLICY "Public delete meals" ON meals FOR DELETE USING (true);

ALTER TABLE meal_plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read meal_plans" ON meal_plans FOR
SELECT USING (true);

CREATE POLICY "Public insert meal_plans" ON meal_plans FOR INSERT
WITH
    CHECK (true);

CREATE POLICY "Public update meal_plans" ON meal_plans
FOR UPDATE
    USING (true);

CREATE POLICY "Public delete meal_plans" ON meal_plans FOR DELETE USING (true);

ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read favorites" ON favorites FOR
SELECT USING (true);

CREATE POLICY "Public insert favorites" ON favorites FOR INSERT
WITH
    CHECK (true);

CREATE POLICY "Public delete favorites" ON favorites FOR DELETE USING (true);

-- 6. Data Awal (Seed Data)
INSERT INTO
    meals (
        name,
        category,
        calories,
        protein,
        carbs,
        fat,
        serving_size,
        description,
        image_url
    )
VALUES (
        'Nasi Goreng Spesial',
        'Lunch',
        450,
        14.0,
        58.0,
        18.0,
        '1 piring',
        'Nasi goreng harum dengan telur, suwiran ayam, dan kecap manis.',
        'https://images.unsplash.com/photo-1603133872878-684f208fb84b?auto=format&fit=crop&w=600&q=80'
    ),
    (
        'Oatmeal Pisang & Madu',
        'Breakfast',
        320,
        10.0,
        56.0,
        6.0,
        '1 mangkuk',
        'Rolled oats hangat dengan pisang ambon dan madu murni.',
        'https://images.unsplash.com/photo-1584776296944-ab6fb57b0bdd?auto=format&fit=crop&w=600&q=80'
    ),
    (
        'Dada Ayam Panggang',
        'Dinner',
        340,
        38.0,
        4.0,
        16.0,
        '200g',
        'Dada ayam fillet panggang rosemary tinggi protein.',
        'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=600&q=80'
    ),
    (
        'Salad Buah Yogurt',
        'Snack',
        160,
        5.0,
        32.0,
        2.0,
        '1 mangkuk',
        'Campuran buah segar dengan dressing greek yogurt.',
        'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=80'
    ),
    (
        'Soto Ayam Lamongan',
        'Lunch',
        380,
        26.0,
        34.0,
        14.0,
        '1 mangkuk',
        'Kuah kaldu kuning harum serai dengan suwiran ayam kampung dan bihun.',
        'https://images.unsplash.com/photo-1572656631137-7935297eff55?auto=format&fit=crop&w=600&q=80'
    ),
    (
        'Smoothie Bowl Buah Naga',
        'Breakfast',
        270,
        8.0,
        48.0,
        6.0,
        '1 mangkuk',
        'Blended buah naga bertabur granola dan chia seed.',
        'https://images.unsplash.com/photo-1590301157890-4810ed352733?auto=format&fit=crop&w=600&q=80'
    ),
    (
        'Ikan Nila Bakar',
        'Dinner',
        310,
        34.0,
        6.0,
        15.0,
        '1 ekor sedang',
        'Ikan nila segar dibakar bumbu kecap manis rendah kalori.',
        'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=80'
    ),
    (
        'Gado-Gado Sayur',
        'Lunch',
        410,
        18.0,
        42.0,
        20.0,
        '1 porsi',
        'Aneka sayuran rebus dengan tahu tempe dan bumbu kacang gurih.',
        'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80'
    ),
    (
        'Greek Yogurt Parfait',
        'Snack',
        190,
        12.0,
        22.0,
        7.0,
        '1 cup',
        'Greek yogurt plain dengan almond panggang dan selai alami.',
        'https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=600&q=80'
    );