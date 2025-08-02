const input = document.getElementById('input');
const output = document.getElementById('output');
const convertirBtn = document.getElementById('convertir');
const mensaje = document.getElementById('mensaje');
const langSelect = document.getElementById('lang');
const title = document.getElementById('title');
const info = document.getElementById('info');

const selectsEntrada = document.querySelectorAll('.contenedor .panel:first-child .tipo');
const selectsSalida = document.querySelectorAll('.contenedor .panel:last-child .tipo');

const uploadBtn = document.getElementById('upload-btn');
const downloadBtn = document.getElementById('download-btn');
const fileInput = document.getElementById('file-upload');

let tipoEntrada = 'json';
let tipoSalida = 'json';
let idioma = 'en';

const textos = {
  es: {
    title: 'Convertidor JSON / CSV / XML',
    info:
      'Conversiones soportadas actualmente:<br />- JSON ⇄ CSV<br />- JSON ⇄ XML<br /><small>No se soportan conversiones directas CSV ⇄ XML</small>',
    placeholderInput: 'Pega aquí tu texto de entrada...',
    placeholderOutput: 'Resultado aquí...',
    botonConvertir: 'Convertir',
    mensajes: {
      mismoFormato: 'Selecciona formatos diferentes para convertir.',
      campoVacio: 'El campo de entrada está vacío.',
      conversionNoSoportada: (e, s) => `Conversión ${e} → ${s} no soportada.`,
      error: (e) => `Error: ${e}`,
    },
  },
  en: {
    title: 'JSON / CSV / XML Converter',
    info:
      'Currently supported conversions:<br />- JSON ⇄ CSV<br />- JSON ⇄ XML<br /><small>Direct CSV ⇄ XML conversions are not supported</small>',
    placeholderInput: 'Paste your input text here...',
    placeholderOutput: 'Result here...',
    botonConvertir: 'Convert',
    mensajes: {
      mismoFormato: 'Please select different formats to convert.',
      campoVacio: 'Input field is empty.',
      conversionNoSoportada: (e, s) => `Conversion ${e} → ${s} not supported.`,
      error: (e) => `Error: ${e}`,
    },
  },
};

function actualizarTextos() {
  const t = textos[idioma];

  title.innerHTML = t.title;
  info.innerHTML = t.info;
  convertirBtn.textContent = t.botonConvertir;
  input.placeholder = t.placeholderInput;
  output.placeholder = t.placeholderOutput;

  // Actualizar los textos de las pestañas de formato
selectsEntrada.forEach(div => {
  const nuevoTexto = div.dataset[`text${idioma.toUpperCase()}`];
  if (nuevoTexto) div.textContent = nuevoTexto;
});
selectsSalida.forEach(div => {
  const nuevoTexto = div.dataset[`text${idioma.toUpperCase()}`];
  if (nuevoTexto) div.textContent = nuevoTexto;
});
}

langSelect.addEventListener('change', () => {
  idioma = langSelect.value;
  limpiarMensaje();
  actualizarTextos();
  actualizarBotones();
});

selectsEntrada.forEach(div => {
  div.addEventListener('click', () => {
    selectsEntrada.forEach(d => d.classList.remove('seleccionado'));
    div.classList.add('seleccionado');
    tipoEntrada = div.dataset.tipo;
    limpiarMensaje();
  });
});

selectsSalida.forEach(div => {
  div.addEventListener('click', () => {
    selectsSalida.forEach(d => d.classList.remove('seleccionado'));
    div.classList.add('seleccionado');
    tipoSalida = div.dataset.tipo;
    limpiarMensaje();
  });
});

convertirBtn.addEventListener('click', () => {
  limpiarMensaje();
  const t = textos[idioma].mensajes;

  if (tipoEntrada === tipoSalida) {
    mostrarMensaje(t.mismoFormato);
    return;
  }
  try {
    const valor = input.value.trim();
    if (!valor) {
      mostrarMensaje(t.campoVacio);
      return;
    }

    let resultado;

    if (tipoEntrada === 'json' && tipoSalida === 'csv') {
      const jsonObj = JSON.parse(valor);
      resultado = jsonToCsv(jsonObj);
    } else if (tipoEntrada === 'csv' && tipoSalida === 'json') {
      resultado = csvToJson(valor);
    } else if (tipoEntrada === 'json' && tipoSalida === 'xml') {
      const jsonObj = JSON.parse(valor);
      resultado = jsonToXml(jsonObj);
    } else if (tipoEntrada === 'xml' && tipoSalida === 'json') {
      resultado = xmlToJson(valor);
      resultado = JSON.stringify(resultado, null, 2);
    } else {
      mostrarMensaje(t.conversionNoSoportada(tipoEntrada, tipoSalida));
      return;
    }

    output.value = resultado;
  } catch (error) {
    mostrarMensaje(t.error(error.message));
  }
});


let nombreArchivoOriginal = 'result';

// Abrir selector de archivo al hacer clic en el botón
uploadBtn.addEventListener('click', () => fileInput.click());

// Manejo del archivo subido
fileInput.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Guardar el nombre original sin extensión
  nombreArchivoOriginal = file.name.replace(/\.[^/.]+$/, '') || 'resultado';

  const reader = new FileReader();
  reader.onload = (event) => {
    input.value = event.target.result;
    limpiarMensaje();
  };
  reader.readAsText(file);
});

// Descargar el archivo convertido
downloadBtn.addEventListener('click', () => {
  const contenido = output.value;
  if (!contenido) return;

  let mimeType = 'text/plain';
  let extension = tipoSalida;

  switch (tipoSalida) {
    case 'json':
      mimeType = 'application/json';
      break;
    case 'csv':
      mimeType = 'text/csv';
      break;
    case 'xml':
      mimeType = 'application/xml';
      break;
  }

  const blob = new Blob([contenido], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `${nombreArchivoOriginal}.${extension}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
});

// Traducción dinámica de botones
function actualizarBotones() {
  uploadBtn.textContent = idioma === 'es' ? 'Subir archivo' : 'Upload file';
  downloadBtn.textContent = idioma === 'es' ? 'Descargar resultado' : 'Download result';
}

function mostrarMensaje(texto) {
  mensaje.textContent = texto;
}

function limpiarMensaje() {
  mensaje.textContent = '';
}

// Funciones auxiliares:

function jsonToCsv(json) {
  let array = Array.isArray(json) ? json : [json];
  if (array.length === 0) return '';

  const keys = Object.keys(array[0]);
  const lines = [
    keys.join(','),
    ...array.map(obj => keys.map(k => `"${(obj[k] ?? '').toString().replace(/"/g, '""')}"`).join(',')),
  ];

  return lines.join('\n');
}

function csvToJson(csv) {
  const lines = csv.trim().split('\n');
  const headers = lines.shift().split(',');
  return JSON.stringify(
    lines.map(line => {
      const values = line.split(',');
      let obj = {};
      headers.forEach((h, i) => {
        obj[h.trim()] = values[i].trim().replace(/^"(.*)"$/, '$1');
      });
      return obj;
    }),
    null,
    2
  );
}

function jsonToXml(obj) {
  let xml = '';

  function traverse(obj, indent = '') {
    if (Array.isArray(obj)) {
      obj.forEach(item => {
        xml += `${indent}<item>\n`;
        traverse(item, indent + '  ');
        xml += `${indent}</item>\n`;
      });
    } else if (typeof obj === 'object' && obj !== null) {
      for (let key in obj) {
        if (Array.isArray(obj[key])) {
          xml += `${indent}<${key}>\n`;
          traverse(obj[key], indent + '  ');
          xml += `${indent}</${key}>\n`;
        } else if (typeof obj[key] === 'object' && obj[key] !== null) {
          xml += `${indent}<${key}>\n`;
          traverse(obj[key], indent + '  ');
          xml += `${indent}</${key}>\n`;
        } else {
          xml += `${indent}<${key}>${obj[key]}</${key}>\n`;
        }
      }
    } else {
      xml += `${indent}${obj}\n`;
    }
  }

  xml += '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<root>\n';
  traverse(obj, '  ');
  xml += '</root>';

  return xml;
}

function xmlToJson(xmlStr) {
  const parser = new DOMParser();
  const xml = parser.parseFromString(xmlStr, 'application/xml');
  if (xml.querySelector('parsererror')) {
    throw new Error(idioma === 'es' ? 'XML inválido' : 'Invalid XML');
  }

  function xmlNodeToJson(node) {
    let obj = {};
    if (node.children.length === 0) {
      return node.textContent;
    }
    for (let child of node.children) {
      const childObj = xmlNodeToJson(child);
      if (obj[child.nodeName]) {
        if (!Array.isArray(obj[child.nodeName])) {
          obj[child.nodeName] = [obj[child.nodeName]];
        }
        obj[child.nodeName].push(childObj);
      } else {
        obj[child.nodeName] = childObj;
      }
    }
    return obj;
  }

  const root = xml.documentElement;

  if (root.nodeName === 'root') {
    let combined = {};
    for (let child of root.children) {
      combined[child.nodeName] = xmlNodeToJson(child);
    }
    return combined;
  } else {
    return xmlNodeToJson(root);
  }
}
// Inicializamos textos
actualizarBotones();
actualizarTextos();