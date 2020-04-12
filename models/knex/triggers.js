const trigger_insert_into_subscription_history = `
  CREATE OR REPLACE FUNCTION insert_into_subscription_history()
  RETURNS trigger
  LANGUAGE plpgsql
  AS $function$
  begin
    INSERT into history.subscription_history(
        subscription,
        plan,
        discount,
        account,
        created_on
    )
    VALUES (
      new.id,
      new.plan,
      new.discount,
      new.account,
      now()
    )
    on conflict do nothing;

    RETURN new;
  end
  $function$
`;

const trigger_insert_into_job_history = `
  CREATE OR REPLACE FUNCTION insert_into_job_history()
  RETURNS trigger
  LANGUAGE plpgsql
  AS $function$
  begin
    INSERT into history.job_history(
      job,
      name,
      description,
      type,
      project,
      script,
      created_by,
      created_on
    )
    VALUES (
      new.id,
      new.name,
      new.description,
      new.type,
      new.project,
      new.script,
      new.created_by,
      now()
    )
    on conflict do nothing;
    RETURN new;
  end
  $function$
`;

const trigger_insert_into_job_schedule_history = `
  CREATE OR REPLACE FUNCTION insert_into_job_schedule_history()
  RETURNS trigger
  LANGUAGE plpgsql
  AS $function$
  begin
    INSERT into history.job_schedule_history(
      job_schedule,
      job,
      type,
      frequency,
      created_on
    )
    VALUES (
      new.id,
      new.job,
      new.type,
      new.frequency,
      now()
    )
    on conflict do nothing;
    RETURN new;
  end
  $function$
`;

const trigger_insert_into_user_involvement_history = `
  CREATE OR REPLACE FUNCTION insert_into_user_involvement_history()
  RETURNS trigger
  LANGUAGE plpgsql
  AS $function$
  begin
    INSERT into history.user_involvement_history(
      user_involvement,
      "user",
      project,
      account,
      user_role,
      user_permission,
      created_on
    )
    VALUES (
      new.id,
      new."user",
      new.project,
      new.account,
      new.user_role,
      new.user_permission,
      now()
    )
    on conflict do nothing;
    RETURN new;
  end
  $function$
`;

module.exports = {
  trigger_insert_into_subscription_history,
  trigger_insert_into_job_history,
  trigger_insert_into_user_involvement_history,
  trigger_insert_into_job_schedule_history,
};
