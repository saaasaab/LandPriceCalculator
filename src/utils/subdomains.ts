import { AppRouter, LandingRouter } from "../Routes";

export const APPS = [
    {
        subdomain: "www",
        app: LandingRouter,
        main: true,
    },
    {
        subdomain: "app",
        app: AppRouter,
        main: false,
    }
]


export const getApp = () => {
    const subdomain = getSubdomains(window.location.hostname);
   
    const main = APPS.find(app=>app.main);

    if(!main) throw new Error("Must have main app");
    if(subdomain === "") return main.app;
    const app = APPS.find(app => subdomain ===app.subdomain);

    if(!app) return main?.app;

    return app.app;

}

export const getSubdomains = (location: string) =>{
    const locationParts = location.split('.');
    let sliceTill = -2;
    // For localhost
    
    const isLocalHost = locationParts.slice(-1)[0] === "localhost";

    if(isLocalHost) sliceTill = -1
     
    return locationParts.slice(0,sliceTill).join("")
}