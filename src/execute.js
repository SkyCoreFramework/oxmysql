import { pool } from './pool';
import { parseParameters } from './parser';
import { slowQueryWarning, debug } from './config';

const resourceName = GetCurrentResourceName() || 'oxmysql';

const execute = async (query, parameters, resource, prepare = true) => {
  ScheduleResourceTick(resourceName);
  try {
    const time = Date.now();

    [query, parameters] = parseParameters(query, parameters);

    const [result] = prepare ? await pool.execute(query, parameters) : await pool.query(query, parameters);

    const executionTime = Date.now() - time;

    if (executionTime >= slowQueryWarning || debug)
      console.log(
        `^3[${debug ? 'DEBUG' : 'WARNING'}] ${resource} took ${executionTime}ms to execute a query!
        ${query} ${JSON.stringify(parameters)}^0`
      );

    return result;
  } catch (error) {
    console.log(
      `^1[ERROR] ${resource} was unable to execute a query!
      ${error.message}
      ${error.sql || `${query} ${JSON.stringify(parameters)}`}^0`
    );
    console.trace(error);
  }
};

export { execute };