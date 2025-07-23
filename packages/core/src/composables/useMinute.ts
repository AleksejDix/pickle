import { createComposable } from "../core/createComposable";

export default createComposable("minute", (date) => date.getMinutes());
