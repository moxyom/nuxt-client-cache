import { createConfigForNuxt } from "@nuxt/eslint-config/flat"
import prettierPluginRecommended from "eslint-plugin-prettier/recommended"

export default createConfigForNuxt({
    dirs: {
        src: ["./playground", "./src"],
    },
    features: {
        stylistic: false,
    },
}).append(prettierPluginRecommended)
