import { createComposable } from "../core/createComposable";

export default createComposable("year", (date) => date.getFullYear());
