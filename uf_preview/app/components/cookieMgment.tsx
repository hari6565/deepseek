import { COOKIE_PREFIX, FULL_BASE_PATH } from "@/lib/cookies";

function prefixName(cname: string) {
  return COOKIE_PREFIX ? `${COOKIE_PREFIX}_${cname}` : cname;
}


export function setCookie(
  cname: string,
  cvalue: string,
  exdays: number = 10,
  path: string = FULL_BASE_PATH
) {
  const d = new Date();
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
  let expires = "expires=" + d.toUTCString();
  document.cookie = prefixName(cname) + "=" + cvalue + ";" + expires + ";path=" + path;
}

  export function getCookie(cname: string) {
    let name = prefixName(cname) + "=";
    if (typeof window == "undefined") {
      return "";
    }
    let ca = document.cookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) == " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) == 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }

export function deleteAllCookies(path: string = FULL_BASE_PATH) {
  const cookies = document.cookie.split(";");

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i];
    const eqPos = cookie.indexOf("=");
    const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    if (!name.includes("cfg")) {
      document.cookie =
        name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=" + path;
    }
  }
}

export function deleteCookie(cookieName: string, path: string = FULL_BASE_PATH) {
  document.cookie = `${prefixName(cookieName)}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=${path};`;
}
