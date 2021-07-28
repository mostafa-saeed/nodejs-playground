import faker from 'faker';
import { promises } from 'fs';

const aGroupPattern = /^[a-j]/i;
const bGroupPattern = /^[k-z]/i;

const createCustomer = () => {
  return {
    name: faker.name.findName(),
  };
};

const createCustomers = (length) => Array.from({ length }, createCustomer);

(async () => {
  const fakeCustomers = createCustomers(1000000);
  // Group
  const aGroup = fakeCustomers.filter((customer) => aGroupPattern.test(
    customer.name
  ));

  const bGroup = fakeCustomers.filter((customer) => bGroupPattern.test(
    customer.name
  ));

  // Write to separate files
  await promises.writeFile('./group1.json', JSON.stringify(aGroup));
  await promises.writeFile('./group2.json', JSON.stringify(bGroup));
})();