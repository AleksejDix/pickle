import { createComposable } from "../core/createComposable";

export default createComposable("second", (date) => date.getSeconds());