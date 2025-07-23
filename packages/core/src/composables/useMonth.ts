import { createComposable } from "../core/createComposable";

export default createComposable("month", (date) => date.getMonth() + 1);
