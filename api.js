var Api = (function (window, document) {

    var GetCookie = function (cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) === ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) === 0) {
                return c.substring(name.length, c.length);
            }
        }
        return undefined;
    };

    var SetCookie = function (name, value, days) {
        var d = new Date;
        d.setTime(d.getTime() + 24 * 60 * 60 * 1000 * days);
        document.cookie = name + "=" + value + ";path=/;expires=" + d.toGMTString();
    };

    var DeleteCookie = function (name) { setCookie(name, '', -1); };

    var bel = document.querySelector('script[data-api-url]');
    var Base = bel.getAttribute('data-api-url');
    var CookieName = bel.getAttribute('data-api-cookie');
    var AuthToken = undefined;

    if (CookieName !== undefined) {
        AuthToken = GetCookie(CookieName);
        console.log("cookie found : " + AuthToken);
    }

    var Request = function (args) {
        return new Promise(function (resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.open(args.method, args.url);
            xhr.setRequestHeader('Accept', 'application/json');
            if (AuthToken !== undefined) {
                xhr.setRequestHeader('Authorization', AuthToken);
            }

            xhr.onload = function () {
                if (this.status >= 200 && this.status < 300) {
                    var data = JSON.parse(this.responseText);
                    resolve(data);
                } else {
                    var response = {};
                    try {
                        response = JSON.parse(this.responseText);
                    } catch (err) { console.log(err); }

                    reject({
                        status: this.status,
                        statusText: xhr.statusText,
                        responseText: this.responseText,
                        data: response
                    });
                }
            };
            xhr.onerror = function () {
                reject({
                    status: this.status,
                    statusText: xhr.statusText
                });
            };
            if (args.headers) {
                Object.keys(args.headers).forEach(function (key) {
                    xhr.setRequestHeader(key, args.headers[key]);
                });
            }
            var params = args.params;
            if (params && typeof params === 'object') {
                params = Object.keys(params).map(function (key) {
                    return encodeURIComponent(key) + '=' + encodeURIComponent(params[key]);
                }).join('&');
            }
            if (args.method === 'POST' || args.method === 'PUT') {
                xhr.setRequestHeader('Content-Type', 'application/json');
                xhr.send(JSON.stringify(args.data));
            } else {
                xhr.send(params);
            }
        });
    };
    var ValidateEmail = function (email) {
        var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    };

    /*
    var GetCookie = function (name) {
        var v = document.cookie.match('(^|;) ?' + name + '=([^;]*)(;|$)');
        return v ? v[2] : null;
    };
    */

    window.Api = this;
    return {
        Base: Base,
        CookieName: CookieName,
        GetCookie: GetCookie,
        SetCookie: SetCookie,
        DeleteCookie: DeleteCookie,
        Request: Request,
        AuthToken: AuthToken,
        ValidateEmail: ValidateEmail
    };
})(window, document);

Api.Test = {
    Get: function () {
        return Api.Request({ method: 'GET', url: Api.Base + '/test' });
    },
    Post: function (data) {
        return Api.Request({ method: 'POST', url: Api.Base + '/test', data: data });
    }
};