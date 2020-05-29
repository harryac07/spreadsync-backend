exports.seed = async (knex) => {
  // Deletes ALL existing entries and populate
  try {
    await knex.raw(`BEGIN`);

    await knex('user').del();
    await knex('user').insert([
      {
        id: '4b36afc8-5205-49c1-af16-4dc6f96db982',
        email: 'harryac07+1@gmail.com',
        password: 'test',
        firstname: 'Hari',
        lastname: 'Adhikari',
        phone: '0449889801',
        is_active: true,
      },
      {
        id: '4b36afc8-5205-49c1-af16-4dc6f96db980',
        email: 'sandeep.thapa@outlook.com',
        firstname: 'Sandeep',
        lastname: 'Thapa',
        password: 'test',
        phone: '1234567890',
        is_active: false,
      },
    ]);

    await knex('account').del();
    await knex('account').insert([
      {
        id: '4b36afc8-5205-49c1-af16-4d76f96db982',
        name: 'Test Account 1',
        admin: '4b36afc8-5205-49c1-af16-4dc6f96db982',
      },
      {
        id: '4b36afc8-5205-49c1-af16-4dc6f96db782',
        name: 'Test Account 2',
        admin: '4b36afc8-5205-49c1-af16-4dc6f96db980',
      },
    ]);

    await knex('plan').del();
    await knex('plan').insert([
      {
        id: '4b36afc8-5205-49c1-af26-4dc6f96db982',
        name: 'Trial',
        interval: 'month',
        amount: 0,
        currency: 'USD',
        description: 'Trial plan',
        trial_days: null,
      },
      {
        id: '4b36afc8-5205-49c1-af27-4dc6f96db982',
        name: 'Starter',
        interval: 'month',
        amount: 10,
        currency: 'USD',
        description: 'Starter plan',
        trial_days: null,
      },
      {
        id: '4b36afc8-5205-49c1-af28-4dc6f96db982',
        name: 'Basic',
        interval: 'month',
        amount: 20,
        currency: 'USD',
        description: 'Basic plan',
        trial_days: null,
      },
      {
        id: '4b36afc8-5205-49c1-af29-4dc6f96db982',
        name: 'Enterprise',
        interval: 'month',
        amount: 50,
        currency: 'USD',
        description: 'Enterprise plan',
        trial_days: null,
      },
    ]);

    await knex('subscription').del();
    await knex('subscription').insert([
      {
        id: '4b36afc8-5205-49c1-af26-4dc6f96db111',
        plan: '4b36afc8-5205-49c1-af26-4dc6f96db982',
        discount: 0,
        account: '4b36afc8-5205-49c1-af16-4d76f96db982',
      },
      {
        id: '4b36afc8-5205-49c1-af26-4dc6f96db112',
        plan: '4b36afc8-5205-49c1-af27-4dc6f96db982',
        discount: 0,
        account: '4b36afc8-5205-49c1-af16-4dc6f96db782',
      },
    ]);

    await knex('project').del();
    await knex('project').insert([
      {
        id: '4b36afc8-5205-49c1-af26-4dc6f26db982',
        name: 'Test project',
        description: 'Spreadsync Test',
        admin: '4b36afc8-5205-49c1-af16-4dc6f96db982',
        account: '4b36afc8-5205-49c1-af16-4d76f96db982',
      },
      {
        id: '4b36afc8-5205-49c1-af26-4dc6f27db982',
        name: 'Test project 1',
        description: 'Export SS',
        admin: '4b36afc8-5205-49c1-af16-4dc6f96db980',
        account: '4b36afc8-5205-49c1-af16-4dc6f96db782',
      },
    ]);

    await knex('job').del();
    await knex('job').insert([
      {
        id: '4b36afc8-5205-49c1-af26-4bc6f96db982',
        name: 'Export to Sreadsheet test',
        description: 'Export Test',
        type: 'Export',
        project: '4b36afc8-5205-49c1-af26-4dc6f26db982',
        script: 'Select * FROM project...',
        created_by: '4b36afc8-5205-49c1-af16-4dc6f96db982',
      },
    ]);

    await knex('job_schedule').del();
    await knex('job_schedule').insert([
      {
        id: '4b36afc8-5205-49c1-af26-4bd6f96db167',
        job: '4b36afc8-5205-49c1-af26-4bc6f96db982',
        type: 'automatic',
        frequency: '1 hours',
      },
    ]);

    await knex('user_role').del();
    await knex('user_role').insert([
      {
        id: '4b36afc8-5205-49c1-af26-1dc6f96db982',
        name: 'Admin',
        description: 'Account Admin',
      },
      {
        id: '4b36afc8-5205-49c1-af26-2dc6f96db982',
        name: 'Developer',
        description: 'Account Developer',
      },
      {
        id: '4b36afc8-5205-49c1-af26-3dc6f96db982',
        name: 'Sales',
        description: 'Account Sales',
      },
      {
        id: '4b36afc8-5205-49c1-af26-5dc6f96db982',
        name: 'Guest',
        description: 'Account Admin',
      },
      {
        id: '4b36afc8-5205-49c1-af26-6dc6f96db982',
        name: 'SuperAdmin',
        description: 'All power to the system',
      },
    ]);

    await knex('user_permission').del();
    await knex('user_permission').insert([
      {
        id: '4b40afc8-5205-49c1-af26-4dc6f96db982',
        name: 'project_read',
        description: 'Read project including all jobs',
      },
      {
        id: '4b41afc8-5205-49c1-af26-4dc6f96db982',
        name: 'project_delete',
        description: 'Delete permission to projects',
      },
      {
        id: '4b42afc8-5205-49c1-af26-4dc6f96db982',
        name: 'project_write',
        description: 'Create and update projects',
      },
      {
        id: '4b43afc8-5205-49c1-af26-4dc6f96db982',
        name: 'project_all',
        description: 'All permission to project (CRUD) including jobs',
      },
      {
        id: '4b44afc8-5205-49c1-af26-4dc6f96db982',
        name: 'jobs_read',
        description: 'Read only to jobs',
      },
      {
        id: '4b45afc8-5205-49c1-af26-4dc6f96db982',
        name: 'jobs_all',
        description: 'All permission to jobs (CRUD)',
      },
      {
        id: '4b46afc8-5205-49c1-af26-4dc6f96db982',
        name: 'user_read',
        description: 'Read all users',
      },
      {
        id: '4b47afc8-5205-49c1-af26-4dc6f96db982',
        name: 'user_write',
        description: 'Create and update users',
      },
      {
        id: '4b48afc8-5205-49c1-af26-4dc6f96db982',
        name: 'user_delete',
        description: 'Remove user from project',
      },
      {
        id: '4b49afc8-5205-49c1-af26-4dc6f96db982',
        name: 'user_all',
        description: 'CRUD users',
      },
      {
        id: '4b50afc8-5205-49c1-af26-4dc6f96db982',
        name: 'super',
        description: 'Admin permission',
      },
    ]);

    await knex('user_involvement').del();
    await knex('user_involvement').insert([
      {
        id: '4b51afc8-5205-49c1-af26-4dc6f96db982',
        user: '4b36afc8-5205-49c1-af16-4dc6f96db982',
        project: '4b36afc8-5205-49c1-af26-4dc6f26db982',
        account: '4b36afc8-5205-49c1-af16-4d76f96db982',
        project_role: '4b36afc8-5205-49c1-af26-1dc6f96db982',
        project_permission: '4b50afc8-5205-49c1-af26-4dc6f96db982',
      },
      {
        id: '4b52afc8-5205-49c1-af26-4dc6f96db982',
        user: '4b36afc8-5205-49c1-af16-4dc6f96db980',
        project: '4b36afc8-5205-49c1-af26-4dc6f27db982',
        account: '4b36afc8-5205-49c1-af16-4dc6f96db782',
        project_role: '4b36afc8-5205-49c1-af26-1dc6f96db982',
        project_permission: '4b50afc8-5205-49c1-af26-4dc6f96db982',
      },
    ]);
    await knex.raw(`COMMIT`);
  } catch (e) {
    console.log(`Error seeding data: ${e}`);
    await knex.raw(`ROLLBACK`);
    console.log('SEEDING ROLLBACK SUCCEED!');
  }
};
