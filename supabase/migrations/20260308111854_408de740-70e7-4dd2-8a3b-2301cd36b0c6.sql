ALTER TABLE wines DROP CONSTRAINT IF EXISTS wines_rating_check;
ALTER TABLE wines ADD CONSTRAINT wines_rating_check CHECK (rating >= 1 AND rating <= 10);

ALTER TABLE drunk_wines DROP CONSTRAINT IF EXISTS drunk_wines_rating_check;
ALTER TABLE drunk_wines ADD CONSTRAINT drunk_wines_rating_check CHECK (rating >= 1 AND rating <= 10);