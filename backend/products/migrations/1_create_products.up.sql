CREATE TABLE products (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  price DOUBLE PRECISION NOT NULL,
  category TEXT NOT NULL,
  image_url TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_price ON products(price);
CREATE INDEX idx_products_created_at ON products(created_at);

-- Insert sample products
INSERT INTO products (name, description, price, category, image_url, stock) VALUES
('iPhone 14 Pro', 'Latest iPhone with advanced camera system', 999.99, 'Electronics', 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=400', 50),
('MacBook Air M2', 'Powerful and lightweight laptop', 1199.99, 'Electronics', 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=400', 30),
('Nike Air Jordan', 'Classic basketball sneakers', 179.99, 'Fashion', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400', 100),
('Adidas Ultraboost', 'Comfortable running shoes', 149.99, 'Fashion', 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400', 75),
('Coffee Maker', 'Premium drip coffee maker', 299.99, 'Home', 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400', 25),
('Bookshelf', 'Modern wooden bookshelf', 199.99, 'Home', 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=400', 15),
('Wireless Headphones', 'Noise-cancelling Bluetooth headphones', 249.99, 'Electronics', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400', 60),
('Smart Watch', 'Fitness tracking smartwatch', 329.99, 'Electronics', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400', 40),
('Denim Jacket', 'Classic blue denim jacket', 89.99, 'Fashion', 'https://images.unsplash.com/photo-1544966503-7cc36a8ceab8?w=400', 80),
('Table Lamp', 'Modern LED desk lamp', 79.99, 'Home', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400', 35);
