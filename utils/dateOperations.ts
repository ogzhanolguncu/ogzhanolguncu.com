export const addTwoMonthToPublishedDate = (publishedDate: Date) => {
  const dateObj = new Date(publishedDate);
  return new Date(dateObj.setMonth(dateObj.getMonth() + 1));
};

export const compareDateWithTodaysDate = (publishedDate: Date) => {
  return publishedDate >= new Date();
};

export const isItDayTime = () => {
  const hours = new Date().getHours();
  const isDayTime = hours > 8 && hours < 18;
  return isDayTime;
};
