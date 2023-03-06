import { environment as defaultEnvironment } from './environment';

export const loader = new Promise<any>((resolve, reject) => {
  const xmlhttp = new XMLHttpRequest(),
    method = 'GET',
    url = './assets/environment.json';
  xmlhttp.open(method, url, true);
  xmlhttp.onload = function () {
    if (xmlhttp.status === 200) {
      resolve(JSON.parse(xmlhttp.responseText));
    } else {
      resolve(defaultEnvironment);
    }
  };
  xmlhttp.send();
});
