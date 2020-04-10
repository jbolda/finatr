const determineUnique = ({ transactions }) =>
  transactions.reduce((uniqueGroups, currentTransaction) => {
    let nextUniqueGroups = uniqueGroups;
    if (!currentTransaction.groups) return uniqueGroups;
    currentTransaction.groups.forEach(group => {
      if (!uniqueGroups.includes(group)) {
        nextUniqueGroups.push(group);
      }
    });
    return uniqueGroups;
  }, []);
export { determineUnique };
