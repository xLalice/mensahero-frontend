import { ThemeType, Theme } from "./Theme.model";

export const THEMES: Record<ThemeType, Theme> = {
    light: {
        "--primary-color": '#00adb5', 
        "--background-color": '#ffffff', 
        "--card-color": '#f9f9f9', 
        "--text-color": '#222222', 
    },
    dark: {
        "--primary-color": '#00adb5', 
        "--background-color": '#222222',
        "--card-color": '#393E46', 
        "--text-color": '#eeeeee',
    }
};
