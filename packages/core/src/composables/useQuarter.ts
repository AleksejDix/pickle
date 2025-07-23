import { createComposable } from "../core/createComposable";

export default createComposable("quarter", (date) => {
  const month = date.getMonth();
  return Math.floor(month / 3) + 1;
});
