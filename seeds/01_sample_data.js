exports.seed = async function (knex) {
  // Clear existing data
  await knex('products').del();
  await knex('companies').del();

  // Insert company
  const [companyId] = await knex('companies')
    .insert({
      name: 'Ecuatoriana Café',
      hq_country: 'Ecuador',
    })
    .returning('id');

  // Insert product linked to company
  await knex('products').insert({
    company_id: companyId.id || companyId, // depends on your DB driver
    name: 'Roasted Coffee',
    certifications: 'organic, fairtrade',
  });
};
