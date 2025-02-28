-- Custom SQL migration file, put your code below! --
INSERT INTO parameters (name, display_name, description, unit, min_safe_value, max_safe_value)
VALUES
  ('co', 'Carbon Monoxide', 'Carbon monoxide concentration', 'mg/m^3', 0, 10),
  ('nmhc', 'Non-Methanic Hydrocarbons', 'Non-methanic hydrocarbon concentration levels', 'µg/m^3', 0, 1000),
  ('benzene', 'Benzene', 'Benzene concentration', 'mg/m^3', 0, 5),
  ('nox', 'Nitrogen Oxides', 'Total nitrogen oxides', 'ppb', 0, 100),
  ('no2', 'Nitrogen Dioxide', 'Nitrogen dioxide levels', 'ppb', 0, 53),
  ('pt08_s1', 'PT08.S1', 'PT08.S1 (tin oxide) sensor response', 'resistance', NULL, NULL),
  ('pt08_s2', 'PT08.S2', 'PT08.S2 (titania) sensor response', 'resistance', NULL, NULL),
  ('pt08_s3', 'PT08.S3', 'PT08.S3 (tungsten oxide) sensor response', 'resistance', NULL, NULL),
  ('pt08_s4', 'PT08.S4', 'PT08.S4 (tungsten oxide) sensor response', 'resistance', NULL, NULL),
  ('pt08_s5', 'PT08.S5', 'PT08.S5 (indium oxide) sensor response', 'resistance', NULL, NULL)
ON CONFLICT (name) DO NOTHING; 