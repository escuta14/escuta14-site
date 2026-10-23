# Monta a página do design escolhido (Aurora) a partir de prototipos.fonte.html, embutindo
# fontes e logo.
#
# Uso: python -P -E montar.py <pasta_das_fontes> <pasta_para_publicar> <pasta_para_testar>
#
# Gera escuta14-aurora.html nas duas pastas. A pasta "para publicar" leva só o conteúdo (o
# claude.ai acrescenta o esqueleto da página); a pasta "para testar" leva a página completa,
# para abrir num servidor local.
#
# As imagens do logo saem antes, do logo_escola.py (limpa o logo horizontal e separa as figuras).
#
# As fontes vêm do Fontshare (gratuitas para uso comercial) e NÃO ficam no repositório:
# baixe os .woff2 de https://api.fontshare.com/v2/css?f[]=<nome>@<peso> para a pasta indicada,
# com os nomes cabinet-grotesk-500 e cabinet-grotesk-800 (.woff2). A página publicada não pode
# buscar fontes fora do Google Fonts, por isso elas vão embutidas.
#
# As rodadas antigas (com os outros designs) ficam em arquivo/ e não são montadas por aqui.
import base64
import json
import pathlib
import sys

AQUI = pathlib.Path(__file__).resolve().parent
RAIZ = AQUI.parent.parent
fontes_dir, pasta_pub, pasta_local = (pathlib.Path(p) for p in sys.argv[1:4])

FONTES = [
    ('Cabinet Grotesk', 500, 'cabinet-grotesk-500'),
    ('Cabinet Grotesk', 800, 'cabinet-grotesk-800'),
]


def b64(caminho):
    return base64.b64encode(pathlib.Path(caminho).read_bytes()).decode('ascii')


regras = []
for familia, peso, arquivo in FONTES:
    dados = b64(fontes_dir / f'{arquivo}.woff2')
    regras.append(
        f'@font-face {{ font-family: "{familia}"; font-weight: {peso}; font-style: normal; '
        f'font-display: swap; src: url(data:font/woff2;base64,{dados}) format("woff2"); }}'
    )

# Imagens do logo, saídas do logo horizontal que a Mariane mandou (logo_escola.py): só as
# figuras (ícone e disco) e o logo completo (topo e rodapé).
REF = RAIZ / 'docs' / 'referencias'
IMAGENS = {
    'figuras': 'data:image/webp;base64,' + b64(REF / 'logo-figuras-web.webp'),
    'escola': 'data:image/webp;base64,' + b64(REF / 'logo-colegio-web.webp'),
}

fonte = (AQUI / 'prototipos.fonte.html').read_text(encoding='utf-8')
assert fonte.count('__FONTES__') == 1 and '__LOGO_FIGURAS__' in fonte and '__LOGO_ESCOLA__' in fonte
# Cada imagem aparece mais de uma vez na página. Para não embutir a mesma imagem duas vezes,
# as <img> ficam sem src, com data-img, e um script no fim preenche todas a partir de uma cópia só.
pagina = fonte.replace('__FONTES__', '\n'.join(regras))
for nome, marcador in (('figuras', '__LOGO_FIGURAS__'), ('escola', '__LOGO_ESCOLA__')):
    pagina = pagina.replace(f'src="{marcador}"', f'data-img="{nome}"')
assert '__LOGO_' not in pagina
pagina += ('\n<script>(function () { const I = ' + json.dumps(IMAGENS) + ';\n'
           'document.querySelectorAll("img[data-img]").forEach((i) => { i.src = I[i.dataset.img]; }); })();</script>\n')

# Cópia para testar fora do claude.ai: o mesmo esqueleto que a publicação acrescenta.
esqueleto = (
    '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">'
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
    '<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top);padding-bottom:env(safe-area-inset-bottom)}'
    'body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>'
    '</head><body>'
)
pasta_pub.mkdir(parents=True, exist_ok=True)
pasta_local.mkdir(parents=True, exist_ok=True)
(pasta_pub / 'escuta14-aurora.html').write_text(pagina, encoding='utf-8')
(pasta_local / 'escuta14-aurora.html').write_text(esqueleto + pagina + '</body></html>', encoding='utf-8')
print(f'escuta14-aurora.html: {(pasta_pub / "escuta14-aurora.html").stat().st_size // 1024} KB')
