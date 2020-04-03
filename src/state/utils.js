const determineUnique = ({ transactions }) => {
  console.log(transactions);
  return transactions.reduce((uniqueGroups, currentTransaction) => {
    let nextUniqueGroups = uniqueGroups;
    currentTransaction.groups.forEach(group => {
      if (!uniqueGroups.includes(group)) {
        nextUniqueGroups.push(group);
      }
    });
    return uniqueGroups;
  }, []);
};
export { determineUnique };
