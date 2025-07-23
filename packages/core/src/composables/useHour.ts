import { createComposable } from "../core/createComposable";

export default createComposable("hour", (date) => date.getHours());
