export const addTwoMonthToPublishedDate = (publishedDate: Date) => {
  const dateObj = new Date(publishedDate);
  return new Date(dateObj.setMonth(dateObj.getMonth() + 2));
};

export const compareDateWithTodaysDate = (publishedDate: Date) => {
  return publishedDate >= new Date();
};
