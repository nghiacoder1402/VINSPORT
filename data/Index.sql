USE QLbanhangquanao;
GO
CREATE INDEX idx_product_category ON Products(category_id);
CREATE INDEX idx_product_brand ON Products(brand_id);
CREATE INDEX idx_variant_product ON ProductVariants(product_id);
CREATE INDEX idx_variant_color ON ProductVariants(color_id);
CREATE INDEX idx_variant_size ON ProductVariants(size_id);
CREATE INDEX idx_order_user ON Orders(user_id);
CREATE INDEX idx_review_product ON Reviews(product_id);
CREATE INDEX idx_sale_date ON Sales(start_date, end_date);
CREATE INDEX idx_product_sale ON ProductSales(product_id);