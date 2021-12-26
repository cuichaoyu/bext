importScripts(
  'https://cdn.jsdelivr.net/npm/rollup@2.60.1/dist/rollup.browser.js',
  'https://cdn.jsdelivr.net/npm/path-browser@2.2.1/path.min.js',
  'https://cdn.jsdelivr.net/npm/@babel/standalone@7.16.4/babel.min.js',
);

const BUILTIN_PREFIX = '@bext/';
const bext = ({ builtins, meta, env }) => {
  const context = ['id', 'name', 'version', ...Object.keys(env || {})]
    .map(
      (prop) =>
        `export const ${prop} = decodeURIComponent('${encodeURIComponent(
          meta[prop] || env[prop],
        )}');`,
    )
    .join('\n');
  Object.assign(builtins, {
    context,
    entry: meta.source,
  });
  return {
    name: 'bext',
    resolveId(id) {
      if (
        id.startsWith(BUILTIN_PREFIX) &&
        id.replace(BUILTIN_PREFIX, '') in builtins
      ) {
        return id;
      }
      return null;
    },
    async load(id) {
      if (id.startsWith(BUILTIN_PREFIX)) {
        const index = id.replace(BUILTIN_PREFIX, '');
        return builtins[index];
      }
      return null;
    },
    transform(code, id) {
      return id === '@bext/entry'
        ? Babel.transform(code, {
            plugins: [
              [
                'transform-react-jsx',
                {
                  pragma: 'h',
                  pragmaFrag: 'Fragment',
                },
              ],
            ],
          }).code
        : null;
    },
    renderChunk(code) {
      return `(function() {
${
  Babel.transform(code, {
    presets: [
      [
        'env',
        {
          targets: 'chrome >= 70',
        },
      ],
    ],
    comments: false,
  }).code
}
})();`;
    },
  };
};

const URL_REG = /^https?:/;

const url = () => {
  return {
    resolveId(source, importer) {
      if (URL_REG.test(source)) {
        return source;
      }
      if (URL_REG.test(importer)) {
        const url = new URL(importer);
        url.pathname = path.resolve(url.pathname, '..', source);
        return url.toString();
      }
      return null;
    },
    async load(id) {
      if (URL_REG.test(id)) {
        const parsedUrl = new URL(id);
        const fileName = parsedUrl.pathname.split('/').pop();
        if (
          parsedUrl.searchParams.has('min') &&
          fileName.endsWith('.js') &&
          !fileName.endsWith('min.js')
        ) {
          const minFileName = fileName.replace(/\.js$/, '.min.js');
          id = path.resolve(id, '..', minFileName);
        }
        return (await fetch(id)).text();
      }
      return null;
    },
  };
};

export async function compile(payload) {
  const bundle = await rollup.rollup({
    input: '@bext/entry',
    plugins: [bext(payload), url()],
  });
  const { output } = await bundle.generate({ format: 'cjs' });
  return output[0].code;
}
