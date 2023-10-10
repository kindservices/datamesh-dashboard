export function dynamicLoad(jsUrl, cssUrl) {
    var script = document.createElement('script');
    script.src = jsUrl;

    var css = document.createElement('link');
    css.rel = "stylesheet";
    css.href = cssUrl;

    document.head.appendChild(script);
    document.head.appendChild(css);
}