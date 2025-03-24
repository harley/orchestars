-- Script: seed_test_data.sql

-- 1. Create event with ID 1 for reference
INSERT INTO events (id, name)
VALUES (1, 'abc')
ON CONFLICT (id) DO NOTHING;

-- 2. Create 10 orders
DO $$
DECLARE
  i INT;
BEGIN
  FOR i IN 1..10 LOOP
    INSERT INTO orders (order_code, status, currency, total, customer_data)
    VALUES (
      CONCAT('ORDER-', i),
      'completed',
      'USD',
      100 + (i - 1) * 10,
      json_build_object('name', CONCAT('Customer ', i))
    );
  END LOOP;
END $$;

-- 3. Create 10 order items with event_id reference
DO $$
DECLARE
  i INT;
  order_id INT;
BEGIN
  FOR i IN 1..10 LOOP
    SELECT id INTO order_id FROM orders WHERE order_code = CONCAT('ORDER-', i);

    INSERT INTO order_items (order_id, event_id, ticket_price_id, ticket_price_name, quantity, price)
    VALUES (
      order_id,
      1,
      CONCAT('price-', i),
      CONCAT('Price Tier ', i),
      2,
      50 + (i - 1) * 5
    );
  END LOOP;
END $$;

-- 4. Create 10 tickets without order_id for testing
DO $$
DECLARE
  i INT;
  order_item_id INT;
BEGIN
  FOR i IN 1..10 LOOP
    SELECT id INTO order_item_id FROM order_items WHERE ticket_price_id = CONCAT('price-', i);

    INSERT INTO tickets (order_item_id, ticket_code, status)
    VALUES (
      order_item_id,
      CONCAT('TICKET-CODE-', i),
      'booked'
    );
  END LOOP;
END $$;

-- 5. Verify final tickets data
SELECT * FROM "tickets";