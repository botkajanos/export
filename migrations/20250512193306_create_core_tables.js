exports.up = function (knex) {
  return knex.schema
    .createTable('companies', tbl => {
      tbl.increments('id').primary();
      tbl.text('name').notNullable();
      tbl.text('tax_id');
      tbl.text('vat_id');
      tbl.text('hq_street');
      tbl.text('hq_city');
      tbl.text('hq_zip');
      tbl.text('hq_country');
      tbl.text('phone');
      tbl.text('fax');
      tbl.text('website');
      tbl.timestamp('created_at').defaultTo(knex.fn.now());
    })
    .createTable('sites', tbl => {
      tbl.increments('id').primary();
      tbl
        .integer('company_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('companies')
        .onDelete('CASCADE');
      tbl.text('type');
      tbl.text('address');
    })
    .createTable('contacts', tbl => {
      tbl.increments('id').primary();
      tbl
        .integer('company_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('companies')
        .onDelete('CASCADE');
      tbl.text('role').notNullable();
      tbl.text('name');
      tbl.text('email');
      tbl.text('phone');
    })
    .createTable('products', tbl => {
      tbl.increments('id').primary();
      tbl
        .integer('company_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('companies')
        .onDelete('CASCADE');
      tbl.text('product_name').notNullable();
      tbl.text('hs_code');
      tbl.text('variant');
      tbl.text('sample_info');
    })
    .createTable('certifications', tbl => {
      tbl.increments('id').primary();
      tbl
        .integer('company_id')
        .unsigned()
        .notNullable()
        .references('id')
        .inTable('companies')
        .onDelete('CASCADE');
      tbl.text('name').notNullable();
      tbl.text('authority');
      tbl.text('reg_no');
      tbl.date('valid_from');
      tbl.date('valid_to');
      tbl.text('description');
    });
};

exports.down = function (knex) {
  return knex.schema
    .dropTableIfExists('certifications')
    .dropTableIfExists('products')
    .dropTableIfExists('contacts')
    .dropTableIfExists('sites')
    .dropTableIfExists('companies');
};

