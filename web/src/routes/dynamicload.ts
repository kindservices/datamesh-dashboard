export function dynamicLoad(jsUrl, cssUrl, container) {
    var script = document.createElement('script');
    script.src = jsUrl;

    var css = document.createElement('link');
    css.rel = "stylesheet";
    css.href = cssUrl;

    container.appendChild(script);
    container.appendChild(css);
}

