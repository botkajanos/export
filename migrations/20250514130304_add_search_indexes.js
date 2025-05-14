/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  
};
exports.up = knex => knex.raw(`
  CREATE INDEX idx_companies_country ON companies (hq_country);
  CREATE INDEX idx_products_name    ON products  (product_name);
`);

exports.down = knex => knex.raw(`
  DROP INDEX IF EXISTS idx_products_name;
  DROP INDEX IF EXISTS idx_companies_country;
`);

